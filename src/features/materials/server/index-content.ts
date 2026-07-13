import { PDFParse } from "pdf-parse";
import { db } from "@/lib/db";
import { getDriveClient } from "@/lib/classroom";
import { GOOGLE_EXPORT_MIME } from "@/features/downloads/server/downloads";
import { indexPostAttachmentContent } from "@/lib/search-posts";

interface PendingIndexMaterial {
  id: string;
  post_id: string;
  drive_file_id: string;
  mime_type: string;
}

const findPendingIndexMaterials = db.prepare(`
  SELECT m.id, m.post_id, m.drive_file_id, m.mime_type
  FROM materials m
  JOIN posts p ON p.id = m.post_id
  WHERE p.course_id = ? AND m.type = 'DRIVE_FILE' AND m.mime_type IN ('application/pdf', 'application/vnd.google-apps.document', 'application/vnd.google-apps.presentation')
    AND m.id NOT IN (SELECT material_id FROM indexed_materials)
`);

const markMaterialIndexed = db.prepare(`INSERT OR IGNORE INTO indexed_materials (material_id) VALUES (?)`);

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks);
}

export async function indexCourseMaterialsContent(courseId: string, redirectUri: string): Promise<void> {
  const pending = findPendingIndexMaterials.all(courseId) as unknown as PendingIndexMaterial[];
  if (pending.length === 0) return;

  const drive = await getDriveClient(redirectUri);

  for (const material of pending) {
    const isGoogleNative = material.mime_type.startsWith("application/vnd.google-apps.");
    const res = isGoogleNative
      ? await drive.files.export(
          { fileId: material.drive_file_id, mimeType: GOOGLE_EXPORT_MIME[material.mime_type] },
          { responseType: "stream" }
        )
      : await drive.files.get({ fileId: material.drive_file_id, alt: "media" }, { responseType: "stream" });

    const buffer = await streamToBuffer(res.data as unknown as NodeJS.ReadableStream);
    const parser = new PDFParse({ data: buffer });
    const { text } = await parser.getText();
    await parser.destroy();

    indexPostAttachmentContent(material.post_id, text);
    markMaterialIndexed.run(material.id);
  }
}
