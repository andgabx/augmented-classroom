import { loadLyceumCredentials } from "@/features/lyceum/server/credentials";
import { loadLyceumSession } from "@/features/lyceum/server/session";
import { LyceumApiClient } from "@/features/lyceum/server/lyceum-client";

export async function getLyceumClient(): Promise<LyceumApiClient | null> {
  const creds = loadLyceumCredentials();
  const session = await loadLyceumSession();
  if (!creds || !session) return null;

  return new LyceumApiClient(creds.tenant, session.sessionId, session.userData, creds.ra, creds.internalId);
}
