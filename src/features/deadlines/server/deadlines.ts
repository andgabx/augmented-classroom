import { db } from "@/lib/db";
import { getTaskStatus, type TaskStatus } from "@/features/deadlines/lib/task-status";
import { searchPosts } from "@/lib/search-posts";
import type { Task } from "@/features/deadlines/types/task";

interface TaskRow {
  id: string;
  course_id: string;
  course_name: string;
  title: string | null;
  text: string | null;
  alternate_link: string;
  due_date: string;
  late: number;
  submission_state: string | null;
}

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    courseId: row.course_id,
    courseName: row.course_name,
    title: row.title,
    description: row.text,
    alternateLink: row.alternate_link,
    dueDate: row.due_date,
    late: Boolean(row.late),
    submissionState: row.submission_state,
  };
}

const TASK_SELECT = `
  SELECT posts.id, posts.course_id, courses.name as course_name, posts.title, posts.text,
         posts.alternate_link, posts.due_date, posts.late, posts.submission_state
  FROM posts
  JOIN courses ON courses.id = posts.course_id
`;

export function getTask(id: string): Task | null {
  const row = db
    .prepare(`${TASK_SELECT} WHERE posts.id = ? AND posts.category = 'TAREFA'`)
    .get(id) as unknown as TaskRow | undefined;
  return row ? toTask(row) : null;
}

export function listTasks(filter: { courseId?: string; status?: TaskStatus[]; query?: string } = {}): Task[] {
  const conditions = ["posts.category = 'TAREFA'", "posts.state = 'PUBLISHED'", "posts.due_date IS NOT NULL"];
  const params: string[] = [];

  if (filter.courseId) {
    conditions.push("posts.course_id = ?");
    params.push(filter.courseId);
  }
  if (filter.query) {
    const matchingPostIds = searchPosts({ query: filter.query, courseId: filter.courseId, category: ["TAREFA"] });
    if (matchingPostIds.length === 0) return [];
    conditions.push(`posts.id IN (${matchingPostIds.map(() => "?").join(",")})`);
    params.push(...matchingPostIds);
  }

  const rows = db
    .prepare(`${TASK_SELECT} WHERE ${conditions.join(" AND ")} ORDER BY posts.due_date ASC, posts.due_time ASC`)
    .all(...params) as unknown as TaskRow[];

  const tasks = rows.map(toTask);
  if (!filter.status?.length) return tasks;

  const statuses = new Set(filter.status);
  return tasks.filter((task) => statuses.has(getTaskStatus(task)));
}
