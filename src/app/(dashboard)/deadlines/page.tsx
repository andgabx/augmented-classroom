import { getTranslations } from "next-intl/server";
import { listTasks } from "@/features/deadlines/server/deadlines";
import { DEFAULT_TASK_STATUSES, type TaskStatus } from "@/features/deadlines/lib/task-status";
import { DeadlineList } from "@/features/deadlines/components/deadline-list";
import { DeadlineFilters } from "@/features/deadlines/components/deadline-filters";
import { SyncDeadlinesButton } from "@/features/deadlines/components/sync-deadlines-button";

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[]; q?: string }>;
}) {
  const t = await getTranslations("deadlines");
  const { status, q } = await searchParams;
  const statuses = toArray(status) as TaskStatus[];
  const tasks = listTasks({ status: statuses.length ? statuses : DEFAULT_TASK_STATUSES, query: q || undefined });

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{t("title")}</h1>
        <SyncDeadlinesButton />
      </div>
      <div className="sticky top-0 z-10 bg-background py-3">
        <DeadlineFilters />
      </div>
      <DeadlineList tasks={tasks} />
    </>
  );
}
