"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { StaggeredSelect, StaggeredSelectItem } from "@/components/ui/staggered-select";
import type { FeedCategory } from "@/features/feed/types/feed-category";
import type { Topic } from "@/features/materials/types/post";
import type { Course } from "@/features/courses/types/course";

const CATEGORIES: { value: FeedCategory; key: "categoryTarefa" | "categoryPergunta" | "categoryMaterial" | "categoryAviso" }[] = [
  { value: "TAREFA", key: "categoryTarefa" },
  { value: "PERGUNTA", key: "categoryPergunta" },
  { value: "MATERIAL", key: "categoryMaterial" },
  { value: "AVISO", key: "categoryAviso" },
];

const ATTACHMENT_OPTIONS: { value: string; key: "filterAllAttachments" | "filterHasAttachment" | "filterNoAttachment" }[] = [
  { value: "", key: "filterAllAttachments" },
  { value: "true", key: "filterHasAttachment" },
  { value: "false", key: "filterNoAttachment" },
];

const SEARCH_DEBOUNCE_MS = 400;

// topics is [] on the global /feed page: topics are course-scoped, so a merged
// cross-course topic list isn't meaningful there — same rationale as hiding
// the course select on the per-course tab (courses prop omitted there).
export function FeedFilters({ topics, courses }: { topics: Topic[]; courses?: Course[] }) {
  const t = useTranslations("feed");
  const tCourses = useTranslations("courses");
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

  function toggleListValue(name: string, value: string, checked: boolean) {
    updateParams((params) => {
      const values = params.getAll(name).filter((v) => v !== value);
      if (checked) values.push(value);
      params.delete(name);
      values.forEach((v) => params.append(name, v));
    });
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

  const feedCategories = searchParams.getAll("feedCategory");
  const topicId = searchParams.get("topicId") ?? "";
  const hasAttachment = searchParams.get("hasAttachment") ?? "";
  const courseId = searchParams.get("courseId") ?? "";

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="rounded-lg bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-shadow focus:shadow-md"
      />

      {courses && courses.length > 0 && (
        <StaggeredSelect value={courseId} onValueChange={(value) => setSingleValue("courseId", value)}>
          <StaggeredSelectItem value="">{tCourses("title")}</StaggeredSelectItem>
          {courses.map((course) => (
            <StaggeredSelectItem key={course.id} value={course.id}>
              {course.name}
            </StaggeredSelectItem>
          ))}
        </StaggeredSelect>
      )}

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-semibold text-muted-foreground">{t("category")}</legend>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <label key={c.value} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={feedCategories.includes(c.value)}
                onChange={(e) => toggleListValue("feedCategory", c.value, e.target.checked)}
              />
              {t(c.key)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-semibold text-muted-foreground">{t("attachments")}</legend>
        <div className="flex flex-wrap gap-3">
          {ATTACHMENT_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="radio"
                name="hasAttachment"
                checked={hasAttachment === option.value}
                onChange={() => setSingleValue("hasAttachment", option.value)}
              />
              {t(option.key)}
            </label>
          ))}
        </div>
      </fieldset>

      {topics.length > 0 && (
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {t("topic")}
          <select
            value={topicId}
            onChange={(e) => setSingleValue("topicId", e.target.value)}
            className="rounded-lg bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-shadow focus:shadow-md"
          >
            <option value="">{t("allTopics")}</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
