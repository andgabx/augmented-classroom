import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { getCourse, listPeriods } from "@/features/courses/server/courses";
import { setCoursePeriodAction } from "@/features/courses/server/actions";
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
    category?: string | string[];
    fileType?: string | string[];
    topicId?: string;
    downloadStatus?: string;
    q?: string;
  }>;
}) {
  const { id } = await params;
  const course = getCourse(id);
  if (!course) {
    notFound();
  }

  if (!hasSyncedMaterials(id)) {
    await syncCourseMaterials(id, await getCallbackRedirectUri());
  }

  const { category, fileType, topicId, downloadStatus, q } = await searchParams;
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
        Voltar para turmas
      </Link>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {course.name}
          </h1>
          {course.section && (
            <span className="text-sm text-muted-foreground">{course.section}</span>
          )}
          <form action={setCoursePeriodAction.bind(null, id)} className="flex items-center gap-2 pt-1">
            <input
              list="periods-list"
              name="periodName"
              defaultValue={course.periodId ?? ""}
              placeholder="Período (ex: 2024.1)"
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-ring"
            />
            <datalist id="periods-list">
              {listPeriods().map((period) => (
                <option key={period.id} value={period.name} />
              ))}
            </datalist>
            <Button type="submit" variant="outline" size="sm">
              Salvar período
            </Button>
          </form>
        </div>
        <form action={syncCourseMaterialsAction.bind(null, id)}>
          <Button type="submit" variant="outline" size="sm">
            Sincronizar
          </Button>
        </form>
      </div>

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
          Materiais ({materials.length})
        </h2>
        <MaterialsView materials={materialsWithStatus} />
      </section>
    </>
  );
}
