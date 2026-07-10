import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const dbPath = path.join(process.cwd(), "augmented-classroom.db");

// Next.js's build step imports this module from multiple parallel workers
// while collecting page data; the timeout option applies a busy_timeout
// from connection open, so a worker waits instead of failing immediately
// with "database is locked" while another worker holds the write lock.
export const db = new DatabaseSync(dbPath, { timeout: 5000 });

db.exec(`PRAGMA journal_mode = WAL;`);

db.exec(`
  CREATE TABLE IF NOT EXISTS auth_tokens (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    refresh_token TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS app_secrets (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    secret TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS google_credentials (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    section TEXT,
    room TEXT,
    course_state TEXT NOT NULL,
    alternate_link TEXT NOT NULL,
    creation_time TEXT,
    update_time TEXT
  );

  CREATE TABLE IF NOT EXISTS periods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS course_teachers (
    course_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    name TEXT NOT NULL,
    photo_url TEXT,
    PRIMARY KEY (course_id, teacher_id)
  );

  CREATE TABLE IF NOT EXISTS topics (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    name TEXT NOT NULL,
    update_time TEXT
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT,
    text TEXT,
    state TEXT NOT NULL,
    work_type TEXT,
    due_date TEXT,
    due_time TEXT,
    topic_id TEXT,
    alternate_link TEXT NOT NULL,
    creation_time TEXT,
    update_time TEXT
  );

  CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    type TEXT NOT NULL,
    drive_file_id TEXT,
    title TEXT,
    alternate_link TEXT,
    thumbnail_url TEXT,
    mime_type TEXT
  );

  CREATE TABLE IF NOT EXISTS downloads (
    material_id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    local_path TEXT,
    error_message TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lyceum_credentials (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    tenant TEXT NOT NULL,
    ra TEXT NOT NULL,
    internal_id TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS lyceum_session (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    session_data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS material_content_fts USING fts5(material_id UNINDEXED, content);
`);

// Next.js's build step imports this module from multiple parallel workers,
// so two workers can both see a column missing and both try to add it;
// the loser hits "duplicate column name", which is fine to ignore here.
function addColumnIfMissing(table: string, column: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (columns.some((c) => c.name === column)) return;
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("duplicate column name")) throw error;
  }
}

addColumnIfMissing("courses", "period_id", "TEXT REFERENCES periods(id)");
addColumnIfMissing("courses", "period_manual", "INTEGER NOT NULL DEFAULT 0");
addColumnIfMissing("courses", "owner_id", "TEXT");
