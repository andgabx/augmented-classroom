import { sealData, unsealData } from "iron-session";
import { db } from "@/lib/db";
import { getAppSecret } from "@/lib/secrets";

export interface LyceumSession {
  sessionId: string;
  userData: string;
}

export async function saveLyceumSession(session: LyceumSession) {
  const sealed = await sealData(session, { password: getAppSecret() });
  db.prepare(
    `INSERT INTO lyceum_session (id, session_data, updated_at)
     VALUES (1, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET session_data = excluded.session_data, updated_at = excluded.updated_at`
  ).run(sealed);
}

export async function loadLyceumSession(): Promise<LyceumSession | null> {
  const row = db.prepare(`SELECT session_data FROM lyceum_session WHERE id = 1`).get() as
    | { session_data: string }
    | undefined;
  if (!row) return null;
  return unsealData<LyceumSession>(row.session_data, { password: getAppSecret() });
}

export function deleteLyceumSession() {
  db.prepare(`DELETE FROM lyceum_session WHERE id = 1`).run();
}

export function hasLyceumSession(): boolean {
  return db.prepare(`SELECT 1 FROM lyceum_session WHERE id = 1`).get() !== undefined;
}
