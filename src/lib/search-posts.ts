import { db } from "@/lib/db";
import type { PostCategory } from "@/features/materials/types/post";

// ponytail: wraps each term in quotes (doubling internal quotes) so user input
// can never trigger FTS5 MATCH operators like *, -, :.
export function escapeFtsQuery(query: string): string | null {
  const terms = query
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `"${term.replace(/"/g, '""')}"`);
  return terms.length ? terms.join(" ") : null;
}

export interface SearchPostsFilter {
  query?: string;
  courseId?: string;
  category?: PostCategory[];
  hasAttachment?: boolean;
}

const deleteSearchEntry = db.prepare(`DELETE FROM post_search_fts WHERE post_id = ?`);
const insertSearchEntry = db.prepare(
  `INSERT INTO post_search_fts (post_id, course_id, category, title, body, content) VALUES (?, ?, ?, ?, ?, ?)`
);
const selectExistingContent = db.prepare(`SELECT content FROM post_search_fts WHERE post_id = ?`);

export interface PostSearchInput {
  id: string;
  courseId: string;
  category: PostCategory;
  title: string | null;
  text: string | null;
}

// FTS5 has no native upsert; delete-then-insert while preserving any
// already-indexed attachment content is the standard workaround.
export function upsertPostSearchEntry(post: PostSearchInput): void {
  const existing = selectExistingContent.get(post.id) as unknown as { content: string } | undefined;
  deleteSearchEntry.run(post.id);
  insertSearchEntry.run(post.id, post.courseId, post.category, post.title ?? "", post.text ?? "", existing?.content ?? "");
}

export function indexPostAttachmentContent(postId: string, text: string): void {
  const existing = selectExistingContent.get(postId) as unknown as { content: string } | undefined;
  if (!existing) return;
  const content = existing.content ? `${existing.content}\n${text}` : text;
  db.prepare(`UPDATE post_search_fts SET content = ? WHERE post_id = ?`).run(content, postId);
}

export function searchPosts(filter: SearchPostsFilter): string[] {
  const conditions: string[] = [];
  const params: string[] = [];

  if (filter.courseId) {
    conditions.push("course_id = ?");
    params.push(filter.courseId);
  }
  if (filter.category?.length) {
    conditions.push(`category IN (${filter.category.map(() => "?").join(",")})`);
    params.push(...filter.category);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db.prepare(`SELECT id FROM posts ${where}`).all(...params) as unknown as { id: string }[];
  let postIds = rows.map((row) => row.id);

  if (filter.query) {
    const ftsQuery = escapeFtsQuery(filter.query);
    if (!ftsQuery) return [];
    const matched = new Set(
      (
        db.prepare(`SELECT post_id FROM post_search_fts WHERE post_search_fts MATCH ?`).all(ftsQuery) as unknown as {
          post_id: string;
        }[]
      ).map((row) => row.post_id)
    );
    postIds = postIds.filter((id) => matched.has(id));
  }

  if (filter.hasAttachment !== undefined) {
    const withAttachments = new Set(
      (db.prepare(`SELECT DISTINCT post_id FROM materials`).all() as unknown as { post_id: string }[]).map(
        (row) => row.post_id
      )
    );
    postIds = postIds.filter((id) => withAttachments.has(id) === filter.hasAttachment);
  }

  return postIds;
}
