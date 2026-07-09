import { db } from "@/lib/db";
import { getClassroomClient } from "@/lib/classroom";
import type { classroom_v1 } from "googleapis";
import type { Course, CourseState, CourseTeacher } from "@/features/courses/types/course";

interface CourseRow {
  id: string;
  name: string;
  section: string | null;
  room: string | null;
  course_state: CourseState;
  alternate_link: string;
  creation_time: string | null;
  update_time: string | null;
}

const selectTeachersByCourse = db.prepare(
  `SELECT name, photo_url FROM course_teachers WHERE course_id = ? ORDER BY name`
);

function getCourseTeachers(courseId: string): CourseTeacher[] {
  const rows = selectTeachersByCourse.all(courseId) as unknown as {
    name: string;
    photo_url: string | null;
  }[];
  return rows.map((row) => ({ name: row.name, photoUrl: row.photo_url }));
}

function toCourse(row: CourseRow): Course {
  return {
    id: row.id,
    name: row.name,
    section: row.section,
    room: row.room,
    courseState: row.course_state,
    alternateLink: row.alternate_link,
    creationTime: row.creation_time,
    updateTime: row.update_time,
    teachers: getCourseTeachers(row.id),
  };
}

const upsertCourse = db.prepare(`
  INSERT INTO courses (id, name, section, room, course_state, alternate_link, creation_time, update_time)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    section = excluded.section,
    room = excluded.room,
    course_state = excluded.course_state,
    alternate_link = excluded.alternate_link,
    creation_time = excluded.creation_time,
    update_time = excluded.update_time
`);

const deleteCourseTeachers = db.prepare(`DELETE FROM course_teachers WHERE course_id = ?`);

const insertCourseTeacher = db.prepare(`
  INSERT INTO course_teachers (course_id, teacher_id, name, photo_url)
  VALUES (?, ?, ?, ?)
`);

async function syncCourseTeachers(classroom: classroom_v1.Classroom, courseId: string) {
  const teachers: { teacherId: string; name: string; photoUrl: string | null }[] = [];

  let pageToken: string | undefined;
  do {
    const { data } = await classroom.courses.teachers.list({ courseId, pageToken });

    for (const teacher of data.teachers ?? []) {
      const name = teacher.profile?.name?.fullName;
      if (!teacher.userId || !name) continue;
      teachers.push({ teacherId: teacher.userId, name, photoUrl: teacher.profile?.photoUrl ?? null });
    }

    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken);

  deleteCourseTeachers.run(courseId);
  for (const teacher of teachers) {
    insertCourseTeacher.run(courseId, teacher.teacherId, teacher.name, teacher.photoUrl);
  }
}

export async function syncCourses(redirectUri: string): Promise<void> {
  const classroom = await getClassroomClient(redirectUri);

  let pageToken: string | undefined;
  do {
    const { data } = await classroom.courses.list({ pageToken });

    for (const course of data.courses ?? []) {
      if (!course.id || !course.name || !course.courseState || !course.alternateLink) {
        continue;
      }

      upsertCourse.run(
        course.id,
        course.name,
        course.section ?? null,
        course.room ?? null,
        course.courseState,
        course.alternateLink,
        course.creationTime ?? null,
        course.updateTime ?? null
      );

      await syncCourseTeachers(classroom, course.id);
    }

    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken);
}

const selectCourseById = db.prepare(`SELECT * FROM courses WHERE id = ?`);

export function getCourse(id: string): Course | null {
  const row = selectCourseById.get(id) as unknown as CourseRow | undefined;
  return row ? toCourse(row) : null;
}

export interface ListCoursesFilter {
  state?: CourseState;
  query?: string;
}

export function listCourses(filter: ListCoursesFilter = {}): Course[] {
  const conditions: string[] = [];
  const params: string[] = [];

  if (filter.state) {
    conditions.push("course_state = ?");
    params.push(filter.state);
  }
  if (filter.query) {
    conditions.push("name LIKE ?");
    params.push(`%${filter.query}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM courses ${where} ORDER BY name`)
    .all(...params) as unknown as CourseRow[];

  return rows.map(toCourse);
}
