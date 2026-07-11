"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { StaggeredSelect, StaggeredSelectItem } from "@/components/ui/staggered-select";
import type { Period, TeacherOption } from "@/features/courses/types/course";

const SEARCH_DEBOUNCE_MS = 400;

export function CoursesFilters({
  teachers,
  periods,
}: {
  teachers: TeacherOption[];
  periods: Period[];
}) {
  const t = useTranslations("courses");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function setSingleValue(name: string, value: string) {
    updateParams((params) => {
      if (value) params.set(name, value);
      else params.delete(name);
    });
  }

  useEffect(() => {
    debounceRef.current = setTimeout(() => setSingleValue("q", query), SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const teacherId = searchParams.get("teacherId") ?? "";
  const periodId = searchParams.get("periodId") ?? "";

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="rounded-lg bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-shadow focus:shadow-md"
      />

      {teachers.length > 0 && (
        <StaggeredSelect value={teacherId} onValueChange={(value) => setSingleValue("teacherId", value)}>
          <StaggeredSelectItem value="">{t("allTeachers")}</StaggeredSelectItem>
          {teachers.map((teacher) => (
            <StaggeredSelectItem key={teacher.id} value={teacher.id}>
              {teacher.name}
            </StaggeredSelectItem>
          ))}
        </StaggeredSelect>
      )}

      {periods.length > 0 && (
        <StaggeredSelect value={periodId} onValueChange={(value) => setSingleValue("periodId", value)}>
          <StaggeredSelectItem value="">{t("allPeriods")}</StaggeredSelectItem>
          {periods.map((period) => (
            <StaggeredSelectItem key={period.id} value={period.id}>
              {period.name}
            </StaggeredSelectItem>
          ))}
        </StaggeredSelect>
      )}
    </div>
  );
}
