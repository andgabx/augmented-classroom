import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const tmpDbPath = path.join(os.tmpdir(), `ac-search-posts-test-${process.pid}.db`);
process.env.DB_PATH = tmpDbPath;

const { db } = await import("../../src/lib/db.ts");
const { upsertPostSearchEntry, indexPostAttachmentContent, searchPosts } = await import("../../src/lib/search-posts.ts");

db.exec(`INSERT INTO courses (id, name, course_state, alternate_link) VALUES ('c1', 'Course 1', 'ACTIVE', 'http://x')`);
db.exec(`
  INSERT INTO posts (id, course_id, category, title, text, state, alternate_link) VALUES
    ('p1', 'c1', 'MATERIAL', 'Aula de Calculo', NULL, 'PUBLISHED', 'http://x/p1'),
    ('p2', 'c1', 'TAREFA', 'Lista de exercicios', NULL, 'PUBLISHED', 'http://x/p2');
  INSERT INTO materials (id, post_id, type) VALUES ('m1', 'p1', 'DRIVE_FILE');
`);

upsertPostSearchEntry({ id: "p1", courseId: "c1", category: "MATERIAL", title: "Aula de Calculo", text: null });
upsertPostSearchEntry({ id: "p2", courseId: "c1", category: "TAREFA", title: "Lista de exercicios", text: null });
indexPostAttachmentContent("p1", "conteudo extraido do PDF sobre derivadas");

assert.deepEqual(searchPosts({ query: "Calculo" }), ["p1"]);
assert.deepEqual(searchPosts({ query: "derivadas" }), ["p1"]);
assert.deepEqual(searchPosts({ category: ["TAREFA"] }), ["p2"]);
assert.deepEqual(searchPosts({ courseId: "c1", query: "exercicios" }), ["p2"]);
assert.deepEqual(searchPosts({ query: "inexistente" }), []);
assert.deepEqual(searchPosts({ hasAttachment: false }), ["p2"]);

console.log("search-posts: OK");

db.close();
for (const suffix of ["", "-wal", "-shm"]) fs.rmSync(`${tmpDbPath}${suffix}`, { force: true });
