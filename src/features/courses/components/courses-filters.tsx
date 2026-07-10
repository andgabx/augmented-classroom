"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
        className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
      />

      {teachers.length > 0 && (
        <select
          value={teacherId}
          onChange={(e) => setSingleValue("teacherId", e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
        >
          <option value="">{t("allTeachers")}</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      )}

      {periods.length > 0 && (
        <select
          value={periodId}
          onChange={(e) => setSingleValue("periodId", e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
        >
          <option value="">{t("allPeriods")}</option>
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
