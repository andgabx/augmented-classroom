"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { DEFAULT_TASK_STATUSES } from "@/features/deadlines/lib/task-status";
import type { TaskStatus } from "@/features/deadlines/lib/task-status";

const STATUSES: { value: TaskStatus; key: "statusPending" | "statusMissing" | "statusTurnedIn" | "statusTurnedInLate" }[] = [
  { value: "PENDING", key: "statusPending" },
  { value: "MISSING", key: "statusMissing" },
  { value: "TURNED_IN", key: "statusTurnedIn" },
  { value: "TURNED_IN_LATE", key: "statusTurnedInLate" },
];

const SEARCH_DEBOUNCE_MS = 400;

export function DeadlineFilters() {
  const t = useTranslations("deadlines");
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

  const explicitStatuses = searchParams.getAll("status");
  const activeStatuses = explicitStatuses.length ? explicitStatuses : DEFAULT_TASK_STATUSES;

  function toggleStatus(value: string, checked: boolean) {
    const values = activeStatuses.filter((v) => v !== value);
    if (checked) values.push(value);

    updateParams((params) => {
      params.delete("status");
      values.forEach((v) => params.append("status", v));
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="rounded-lg bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none transition-shadow focus:shadow-md"
      />
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-sm font-semibold text-muted-foreground">{t("status")}</legend>
        <div className="flex flex-wrap gap-3">
          {STATUSES.map((status) => (
            <label key={status.value} className="flex items-center gap-1.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={activeStatuses.includes(status.value)}
                onChange={(e) => toggleStatus(status.value, e.target.checked)}
              />
              {t(status.key)}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
