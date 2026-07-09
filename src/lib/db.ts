import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const dbPath = path.join(process.cwd(), "augmented-classroom.db");

export const db = new DatabaseSync(dbPath);

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
`);
