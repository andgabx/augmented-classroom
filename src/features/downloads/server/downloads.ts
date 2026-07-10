import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { db } from "@/lib/db";
import { getDriveClient } from "@/lib/classroom";
import type { Download, DownloadListItem, DownloadStatus } from "@/features/downloads/types/download";

const MATERIALS_ROOT = path.join(process.cwd(), "Materiais");

function sanitize(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, "_").replace(/[. ]+$/, "").slice(0, 150) || "sem-nome";
}

interface DownloadRow {
  material_id: string;
  status: DownloadStatus;
  local_path: string | null;
  error_message: string | null;
  attempts: number;
  updated_at: string;
}

function toDownload(row: DownloadRow): Download {
  return {
    materialId: row.material_id,
    status: row.status,
    localPath: row.local_path,
    errorMessage: row.error_message,
    attempts: row.attempts,
    updatedAt: row.updated_at,
  };
}

const upsertDownload = db.prepare(`
  INSERT INTO downloads (material_id, status, local_path, error_message, attempts, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
  ON CONFLICT(material_id) DO UPDATE SET
    status = excluded.status,
    local_path = excluded.local_path,
    error_message = excluded.error_message,
    attempts = excluded.attempts,
    updated_at = excluded.updated_at
`);

export function markQueued(materialId: string) {
  upsertDownload.run(materialId, "QUEUED", null, null, 0);
}

export function markDownloading(materialId: string, attempts: number) {
  upsertDownload.run(materialId, "DOWNLOADING", null, null, attempts);
}

export function markDone(materialId: string, localPath: string, attempts: number) {
  upsertDownload.run(materialId, "DONE", localPath, null, attempts);
}

export function markError(materialId: string, message: string, attempts: number) {
  upsertDownload.run(materialId, "ERROR", null, message, attempts);
}

export function listDownloadsForCourse(courseId: string): Download[] {
  const rows = db
    .prepare(
      `SELECT d.*
       FROM downloads d
       JOIN materials m ON m.id = d.material_id
       JOIN posts p ON p.id = m.post_id
       WHERE p.course_id = ?
       ORDER BY d.updated_at DESC`
    )
    .all(courseId) as unknown as DownloadRow[];

  return rows.map(toDownload);
}

interface DownloadListRow extends DownloadRow {
  course_id: string;
  course_name: string;
  material_title: string | null;
  post_title: string | null;
  post_text: string | null;
}

export function listAllDownloads(untitledLabel: string): DownloadListItem[] {
  const rows = db
    .prepare(
      `SELECT d.*, c.id as course_id, c.name as course_name,
              m.title as material_title, p.title as post_title, p.text as post_text
       FROM downloads d
       JOIN materials m ON m.id = d.material_id
       JOIN posts p ON p.id = m.post_id
       JOIN courses c ON c.id = p.course_id
       ORDER BY d.updated_at DESC`
    )
    .all() as unknown as DownloadListRow[];

  return rows.map((row) => ({
    ...toDownload(row),
    courseId: row.course_id,
    courseName: row.course_name,
    materialLabel: row.material_title ?? row.post_title ?? row.post_text ?? untitledLabel,
  }));
}

export function deleteDownload(materialId: string) {
  db.prepare(`DELETE FROM downloads WHERE material_id = ?`).run(materialId);
}

export function clearAllDownloads() {
  db.prepare(`DELETE FROM downloads`).run();
}

interface MaterialDownloadContext {
  id: string;
  type: string;
  drive_file_id: string | null;
  material_title: string | null;
  mime_type: string | null;
  post_title: string | null;
  post_text: string | null;
  category: string;
  course_name: string;
  topic_name: string | null;
}

const selectDownloadContext = db.prepare(`
  SELECT m.id, m.type, m.drive_file_id, m.title as material_title, m.mime_type,
         p.title as post_title, p.text as post_text, p.category,
         c.name as course_name, t.name as topic_name
  FROM materials m
  JOIN posts p ON p.id = m.post_id
  JOIN courses c ON c.id = p.course_id
  LEFT JOIN topics t ON t.id = p.topic_id
  WHERE m.id = ?
`);

export const GOOGLE_EXPORT_MIME: Record<string, string> = {
  "application/vnd.google-apps.document": "application/pdf",
  "application/vnd.google-apps.presentation": "application/pdf",
  "application/vnd.google-apps.spreadsheet":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const EXTENSION_FOR_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
};

export async function downloadMaterialFile(materialId: string, redirectUri: string): Promise<string> {
  const ctx = selectDownloadContext.get(materialId) as unknown as MaterialDownloadContext | undefined;
  if (!ctx || ctx.type !== "DRIVE_FILE" || !ctx.drive_file_id) {
    throw new Error("Material has no downloadable file");
  }

  const folder = path.join(
    MATERIALS_ROOT,
    sanitize(ctx.course_name),
    sanitize(ctx.topic_name ?? ctx.post_title ?? ctx.post_text ?? ctx.category)
  );
  await fs.promises.mkdir(folder, { recursive: true });

  const drive = await getDriveClient(redirectUri);
  const isGoogleNative = ctx.mime_type?.startsWith("application/vnd.google-apps.") ?? false;

  let baseName = sanitize(ctx.material_title ?? ctx.post_title ?? ctx.id);
  let ext: string;
  let data: NodeJS.ReadableStream;

  if (isGoogleNative) {
    const exportMime = GOOGLE_EXPORT_MIME[ctx.mime_type!] ?? "application/pdf";
    ext = EXTENSION_FOR_MIME[exportMime] ?? ".pdf";
    const res = await drive.files.export(
      { fileId: ctx.drive_file_id, mimeType: exportMime },
      { responseType: "stream" }
    );
    data = res.data as unknown as NodeJS.ReadableStream;
  } else {
    const existingExt = path.extname(baseName);
    ext = existingExt || EXTENSION_FOR_MIME[ctx.mime_type ?? ""] || "";
    if (existingExt) baseName = baseName.slice(0, -existingExt.length);
    const res = await drive.files.get(
      { fileId: ctx.drive_file_id, alt: "media" },
      { responseType: "stream" }
    );
    data = res.data as unknown as NodeJS.ReadableStream;
  }

  let filePath = path.join(folder, `${baseName}${ext}`);
  if (fs.existsSync(filePath)) {
    filePath = path.join(folder, `${baseName} (${ctx.drive_file_id})${ext}`);
  }

  await pipeline(data, fs.createWriteStream(filePath));
  return filePath;
}
