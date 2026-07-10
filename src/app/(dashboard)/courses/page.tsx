import { Suspense } from "react";
import { listCourses, listPeriods, listTeachers, syncCourses } from "@/features/courses/server/courses";
import { syncCoursesAction } from "@/features/courses/server/actions";
import { CoursesView } from "@/features/courses/components/courses-view";
import { CoursesFilters } from "@/features/courses/components/courses-filters";
import { Button } from "@/components/ui/button";
import { getCallbackRedirectUri } from "@/lib/redirect-uri";
import type { CourseState } from "@/features/courses/types/course";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; teacherId?: string; periodId?: string }>;
}) {
  const { q, teacherId, periodId } = await searchParams;

  if (listCourses().length === 0) {
    await syncCourses(await getCallbackRedirectUri());
  }

  const states: CourseState[] = ["ACTIVE", "ARCHIVED"];
  const [active, archived] = states.map((state) =>
    listCourses({ state, query: q, teacherId, periodId })
  );

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Turmas
        </h1>
        <form action={syncCoursesAction}>
          <Button type="submit" variant="outline" size="sm">
            Sincronizar
          </Button>
        </form>
      </div>

      <Suspense fallback={null}>
        <CoursesFilters teachers={listTeachers()} periods={listPeriods()} />
      </Suspense>

      <CoursesView active={active} archived={archived} />
    </>
  );
}
