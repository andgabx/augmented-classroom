import { listCourses, syncCourses } from "@/features/courses/server/courses";
import { syncCoursesAction } from "@/features/courses/server/actions";
import { CoursesView } from "@/features/courses/components/courses-view";
import { Button } from "@/components/ui/button";
import { getCallbackRedirectUri } from "@/lib/redirect-uri";
import type { CourseState } from "@/features/courses/types/course";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  if (listCourses().length === 0) {
    await syncCourses(await getCallbackRedirectUri());
  }

  const states: CourseState[] = ["ACTIVE", "ARCHIVED"];
  const [active, archived] = states.map((state) => listCourses({ state, query: q }));

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

      <form className="flex flex-col gap-1.5">
        <input
          name="q"
          type="text"
          defaultValue={q}
          placeholder="Buscar por nome"
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
        />
      </form>

      <CoursesView active={active} archived={archived} />
    </>
  );
}
