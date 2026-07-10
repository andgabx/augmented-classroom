import { db } from "@/lib/db";

export interface LyceumCredentials {
  tenant: string;
  ra: string;
  internalId: string;
}

export function saveLyceumCredentials(creds: LyceumCredentials) {
  db.prepare(
    `INSERT INTO lyceum_credentials (id, tenant, ra, internal_id, updated_at)
     VALUES (1, ?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       tenant = excluded.tenant,
       ra = excluded.ra,
       internal_id = excluded.internal_id,
       updated_at = excluded.updated_at`
  ).run(creds.tenant, creds.ra, creds.internalId);
}

export function loadLyceumCredentials(): LyceumCredentials | null {
  const row = db
    .prepare(`SELECT tenant, ra, internal_id FROM lyceum_credentials WHERE id = 1`)
    .get() as { tenant: string; ra: string; internal_id: string } | undefined;

  if (!row) return null;

  return {
    tenant: row.tenant,
    ra: row.ra,
    internalId: row.internal_id,
  };
}

export function hasLyceumCredentials(): boolean {
  return loadLyceumCredentials() !== null;
}

export function deleteLyceumCredentials() {
  db.prepare(`DELETE FROM lyceum_credentials WHERE id = 1`).run();
}
