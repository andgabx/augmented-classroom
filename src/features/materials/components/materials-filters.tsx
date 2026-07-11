"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { FileTypeGroup, PostCategory, Topic } from "@/features/materials/types/post";

const CATEGORIES: { value: PostCategory; key: "categoryTarefa" | "categoryMaterial" | "categoryAviso" }[] = [
  { value: "TAREFA", key: "categoryTarefa" },
  { value: "MATERIAL", key: "categoryMaterial" },
  { value: "AVISO", key: "categoryAviso" },
];

const FILE_TYPES: {
  value: FileTypeGroup;
  key:
    | "fileTypePdf"
    | "fileTypeWord"
    | "fileTypeSlides"
    | "fileTypeSheets"
    | "fileTypeImage"
    | "fileTypeVideo"
    | "fileTypeLink"
    | "fileTypeOther";
}[] = [
  { value: "PDF", key: "fileTypePdf" },
  { value: "WORD", key: "fileTypeWord" },
  { value: "SLIDES", key: "fileTypeSlides" },
  { value: "SHEETS", key: "fileTypeSheets" },
  { value: "IMAGE", key: "fileTypeImage" },
  { value: "VIDEO", key: "fileTypeVideo" },
  { value: "LINK", key: "fileTypeLink" },
  { value: "OTHER", key: "fileTypeOther" },
];

const DOWNLOAD_STATUS_OPTIONS: { value: string; key: "downloadStatusAll" | "downloadStatusNew" | "downloadStatusDownloaded" }[] = [
  { value: "", key: "downloadStatusAll" },
  { value: "NOVO", key: "downloadStatusNew" },
  { value: "BAIXADO", key: "downloadStatusDownloaded" },
];

const SEARCH_DEBOUNCE_MS = 400;

export function MaterialsFilters({ topics }: { topics: Topic[] }) {
  const t = useTranslations("materials");
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
    debounceRef.current = setTimeout(() => {
      setSingleValue("q", query);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const categories = searchParams.getAll("category");
  const fileTypes = searchParams.getAll("fileType");
  const topicId = searchParams.get("topicId") ?? "";
  const downloadStatus = searchParams.get("downloadStatus") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="rounded-lg bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-shadow focus:shadow-md"
      />

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {t("postedFrom")}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setSingleValue("dateFrom", e.target.value)}
            className="rounded-lg bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-shadow focus:shadow-md"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {t("postedTo")}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setSingleValue("dateTo", e.target.value)}
            className="rounded-lg bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-shadow focus:shadow-md"
          />
        </label>
      </div>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-semibold text-muted-foreground">{t("category")}</legend>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <label key={c.value} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={categories.includes(c.value)}
                onChange={(e) => toggleListValue("category", c.value, e.target.checked)}
              />
              {t(c.key)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-semibold text-muted-foreground">{t("fileType")}</legend>
        <div className="flex flex-wrap gap-3">
          {FILE_TYPES.map((f) => (
            <label key={f.value} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={fileTypes.includes(f.value)}
                onChange={(e) => toggleListValue("fileType", f.value, e.target.checked)}
              />
              {t(f.key)}
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

      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-semibold text-muted-foreground">{t("downloadStatus")}</legend>
        <div className="flex flex-wrap gap-3">
          {DOWNLOAD_STATUS_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="radio"
                name="downloadStatus"
                checked={downloadStatus === option.value}
                onChange={() => setSingleValue("downloadStatus", option.value)}
              />
              {t(option.key)}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
