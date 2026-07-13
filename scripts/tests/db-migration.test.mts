import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const tmpDbPath = path.join(os.tmpdir(), `ac-db-migration-test-${process.pid}.db`);

const legacyDb = new DatabaseSync(tmpDbPath);
legacyDb.exec(`
  CREATE TABLE courses (id TEXT PRIMARY KEY, name TEXT NOT NULL, section TEXT, room TEXT, course_state TEXT NOT NULL, alternate_link TEXT NOT NULL, creation_time TEXT, update_time TEXT);
  CREATE TABLE posts (id TEXT PRIMARY KEY, course_id TEXT NOT NULL, category TEXT NOT NULL, title TEXT, text TEXT, state TEXT NOT NULL, work_type TEXT, due_date TEXT, due_time TEXT, topic_id TEXT, alternate_link TEXT NOT NULL, creation_time TEXT, update_time TEXT);
  CREATE TABLE materials (id TEXT PRIMARY KEY, post_id TEXT NOT NULL, type TEXT NOT NULL, drive_file_id TEXT, title TEXT, alternate_link TEXT, thumbnail_url TEXT, mime_type TEXT);
  CREATE VIRTUAL TABLE material_content_fts USING fts5(material_id UNINDEXED, content);

  INSERT INTO courses (id, name, course_state, alternate_link) VALUES ('c1', 'Course 1', 'ACTIVE', 'http://x');
  INSERT INTO posts (id, course_id, category, title, text, state, alternate_link) VALUES ('p1', 'c1', 'MATERIAL', 'Aula 1', NULL, 'PUBLISHED', 'http://x/p1');
  INSERT INTO materials (id, post_id, type, mime_type) VALUES ('m1', 'p1', 'DRIVE_FILE', 'application/pdf');
  INSERT INTO material_content_fts (material_id, content) VALUES ('m1', 'conteudo antigo do pdf');
`);
legacyDb.close();

process.env.DB_PATH = tmpDbPath;
const { db } = await import("../../src/lib/db.ts");

const ftsRow = db.prepare(`SELECT title, content FROM post_search_fts WHERE post_id = 'p1'`).get() as unknown as
  | { title: string; content: string }
  | undefined;
assert.ok(ftsRow, "post_search_fts should have a row for p1");
assert.equal(ftsRow.content, "conteudo antigo do pdf");
assert.equal(ftsRow.title, "Aula 1");

const indexed = db.prepare(`SELECT material_id FROM indexed_materials WHERE material_id = 'm1'`).get();
assert.ok(indexed, "m1 should be marked as already indexed");

const oldTable = db.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'material_content_fts'`).get();
assert.equal(oldTable, undefined, "material_content_fts should be dropped");

console.log("db-migration: OK");

db.close();
for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(`${tmpDbPath}${suffix}`, { force: true });
