import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getCourse } from "@/features/courses/server/courses";
import { PeriodForm } from "@/features/courses/components/period-form";
import {
  hasSyncedMaterials,
  listCourseMaterials,
  listTopics,
  syncCourseMaterials,
} from "@/features/materials/server/materials";
import { syncCourseMaterialsAction } from "@/features/materials/server/actions";
import { MaterialsFilters } from "@/features/materials/components/materials-filters";
import { MaterialsView, type MaterialWithStatus } from "@/features/materials/components/materials-view";
import { listDownloadsForCourse } from "@/features/downloads/server/downloads";
import { enqueueDownloadsAction } from "@/features/downloads/server/actions";
import { DownloadAllButton } from "@/features/downloads/components/download-all-button";
import { CourseTabs } from "@/features/courses/components/course-tabs";
import { courseTabFromSearchParams } from "@/features/courses/types/course-tab";
import { Button } from "@/components/ui/button";
import { getCallbackRedirectUri } from "@/lib/redirect-uri";
import type { FileTypeGroup, PostCategory } from "@/features/materials/types/post";

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function CourseMaterialsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    tab?: string;
    category?: string | string[];
    fileType?: string | string[];
    topicId?: string;
    downloadStatus?: string;
    q?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const { id } = await params;
  const t = await getTranslations("courses");
  const course = getCourse(id);
  if (!course) {
    notFound();
  }

  if (!hasSyncedMaterials(id)) {
    await syncCourseMaterials(id, await getCallbackRedirectUri());
  }

  const { tab, category, fileType, topicId, downloadStatus, q, dateFrom, dateTo } = await searchParams;
  const activeTab = courseTabFromSearchParams(tab);
  const categories = toArray(category) as PostCategory[];
  const fileTypes = toArray(fileType) as FileTypeGroup[];

  const topics = listTopics(id);
  const statusByMaterial = new Map(
    listDownloadsForCourse(id).map((download) => [download.materialId, download.status])
  );

  let materials = listCourseMaterials(id, {
    category: categories.length ? categories : undefined,
    fileType: fileTypes.length ? fileTypes : undefined,
    topicId: topicId || undefined,
    query: q || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  if (downloadStatus === "NOVO") {
    materials = materials.filter((material) => statusByMaterial.get(material.id) !== "DONE");
  } else if (downloadStatus === "BAIXADO") {
    materials = materials.filter((material) => statusByMaterial.get(material.id) === "DONE");
  }

  const downloadableIds = materials.filter((material) => material.type === "DRIVE_FILE").map((material) => material.id);
  const materialsWithStatus: MaterialWithStatus[] = materials.map((material) => ({
    ...material,
    downloadStatus: statusByMaterial.get(material.id),
  }));

  return (
    <>
      <Link
        href="/courses"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToClasses")}
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {course.name}
          </h1>
          {course.section && (
            <span className="text-sm text-muted-foreground">{course.section}</span>
          )}
          <PeriodForm courseId={id} periodId={course.periodId} />
        </div>
        <form action={syncCourseMaterialsAction.bind(null, id)}>
          <Button type="submit" variant="outline" size="sm">
            {t("sync")}
          </Button>
        </form>
      </div>

      <Suspense fallback={null}>
        <CourseTabs active={activeTab} />
      </Suspense>

      {activeTab === "documentos" ? (
        <>
          <Suspense fallback={null}>
            <MaterialsFilters topics={topics} />
          </Suspense>

          <DownloadAllButton
            action={enqueueDownloadsAction.bind(null, downloadableIds)}
            courseName={course.name}
            count={downloadableIds.length}
          />

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {t("materialsCount", { count: materials.length })}
            </h2>
            <MaterialsView materials={materialsWithStatus} />
          </section>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t("tabPrazosComingSoon")}</p>
      )}
    </>
  );
}
