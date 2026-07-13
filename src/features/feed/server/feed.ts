import { db } from "@/lib/db";
import { searchPosts } from "@/lib/search-posts";
import { deriveFeedCategory, feedCategoryToPostCategories } from "@/features/feed/types/feed-category";
import type { FeedCategory } from "@/features/feed/types/feed-category";
import type { FeedPost } from "@/features/feed/types/feed-post";
import type { Material, MaterialType, PostCategory } from "@/features/materials/types/post";

export interface ListFeedFilter {
  courseId?: string;
  query?: string;
  feedCategory?: FeedCategory[];
  hasAttachment?: boolean;
  topicId?: string;
}

interface PostRow {
  id: string;
  course_id: string;
  course_name: string;
  category: PostCategory;
  work_type: string | null;
  title: string | null;
  text: string | null;
  alternate_link: string;
  creation_time: string | null;
}

interface MaterialRow {
  id: string;
  post_id: string;
  type: MaterialType;
  drive_file_id: string | null;
  title: string | null;
  alternate_link: string | null;
  thumbnail_url: string | null;
  mime_type: string | null;
}

export function listFeed(filter: ListFeedFilter = {}): FeedPost[] {
  const conditions = ["posts.state = 'PUBLISHED'"];
  const params: string[] = [];

  if (filter.courseId) {
    conditions.push("posts.course_id = ?");
    params.push(filter.courseId);
  }
  if (filter.topicId) {
    conditions.push("posts.topic_id = ?");
    params.push(filter.topicId);
  }

  const categories = filter.feedCategory?.length ? feedCategoryToPostCategories(filter.feedCategory) : undefined;
  if (categories) {
    conditions.push(`posts.category IN (${categories.map(() => "?").join(",")})`);
    params.push(...categories);
  }

  if (filter.query || filter.hasAttachment !== undefined) {
    const matchingPostIds = searchPosts({
      query: filter.query,
      courseId: filter.courseId,
      category: categories,
      hasAttachment: filter.hasAttachment,
    });
    if (matchingPostIds.length === 0) return [];
    conditions.push(`posts.id IN (${matchingPostIds.map(() => "?").join(",")})`);
    params.push(...matchingPostIds);
  }

  const rows = db
    .prepare(
      `SELECT posts.id, posts.course_id, courses.name as course_name, posts.category, posts.work_type,
              posts.title, posts.text, posts.alternate_link, posts.creation_time
       FROM posts
       JOIN courses ON courses.id = posts.course_id
       WHERE ${conditions.join(" AND ")}
       ORDER BY posts.creation_time DESC`
    )
    .all(...params) as unknown as PostRow[];

  if (rows.length === 0) return [];

  const postIds = rows.map((row) => row.id);
  const materialRows = db
    .prepare(
      `SELECT id, post_id, type, drive_file_id, title, alternate_link, thumbnail_url, mime_type
       FROM materials WHERE post_id IN (${postIds.map(() => "?").join(",")})`
    )
    .all(...postIds) as unknown as MaterialRow[];

  const attachmentsByPost = new Map<string, Material[]>();
  for (const row of materialRows) {
    const material: Material = {
      id: row.id,
      postId: row.post_id,
      type: row.type,
      driveFileId: row.drive_file_id,
      title: row.title,
      alternateLink: row.alternate_link,
      thumbnailUrl: row.thumbnail_url,
      mimeType: row.mime_type,
    };
    const list = attachmentsByPost.get(row.post_id) ?? [];
    list.push(material);
    attachmentsByPost.set(row.post_id, list);
  }

  let feedPosts: FeedPost[] = rows.map((row) => ({
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name,
    feedCategory: deriveFeedCategory(row.category, row.work_type),
    title: row.title,
    text: row.text,
    alternateLink: row.alternate_link,
    creationTime: row.creation_time,
    attachments: attachmentsByPost.get(row.id) ?? [],
  }));

  // posts.category IN (...) above can only narrow to TAREFA/MATERIAL/AVISO;
  // splitting Tarefa from Pergunta needs this extra JS-level pass.
  if (filter.feedCategory?.length) {
    const wanted = new Set(filter.feedCategory);
    feedPosts = feedPosts.filter((post) => wanted.has(post.feedCategory));
  }

  return feedPosts;
}
