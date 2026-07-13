import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getTask } from "@/features/deadlines/server/deadlines";
import { formatDue } from "@/features/deadlines/lib/format-due";
import { getTaskStatus } from "@/features/deadlines/lib/task-status";
import { listCourseMaterials, listSubmissionAttachments } from "@/features/materials/server/materials";
import { MaterialsView } from "@/features/materials/components/materials-view";
import { Button } from "@/components/ui/button";

const STATUS_KEY = {
  PENDING: "statusPending",
  MISSING: "statusMissing",
  TURNED_IN: "statusTurnedIn",
  TURNED_IN_LATE: "statusTurnedInLate",
} as const;

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = getTask(id);
  if (!task) {
    notFound();
  }

  const [t, tCourses, tMaterials, locale] = await Promise.all([
    getTranslations("deadlines"),
    getTranslations("courses"),
    getTranslations("materials"),
    getLocale(),
  ]);

  const due = formatDue(task.dueDate, locale);
  const status = getTaskStatus(task);
  const statusLabel = t(STATUS_KEY[status]);

  const materials = listCourseMaterials(task.courseId, { postId: task.id }).map((material) => ({
    ...material,
    downloadStatus: undefined,
  }));
  const submissionAttachments = listSubmissionAttachments(task.id);

  return (
    <>
      <Link
        href="/deadlines"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToDeadlines")}
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{task.title ?? t("untitled")}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{task.courseName}</span>
            <span>·</span>
            <span>{due.label}</span>
            <span
              className={
                status === "TURNED_IN" || status === "TURNED_IN_LATE"
                  ? "rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground"
                  : status === "MISSING"
                    ? "text-xs font-medium text-destructive"
                    : "text-xs text-muted-foreground"
              }
            >
              {statusLabel}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={<a href={task.alternateLink} target="_blank" rel="noopener noreferrer" />}
        >
          {tCourses("openInClassroom")}
          <ExternalLink className="size-4" />
        </Button>
      </div>

      {task.description && <p className="whitespace-pre-wrap text-sm text-foreground">{task.description}</p>}

      <MaterialsView materials={materials} />

      {submissionAttachments.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">{t("mySubmission")}</h2>
          <ul className="flex flex-col gap-2">
            {submissionAttachments.map((attachment) => (
              <li key={attachment.id}>
                <a
                  href={attachment.alternateLink ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm transition-shadow duration-200 hover:shadow-lg"
                >
                  <span className="font-medium text-foreground">{attachment.title ?? tMaterials("untitled")}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
