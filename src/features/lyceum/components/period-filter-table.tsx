"use client";

import { useState } from "react";
import { detectPeriodColumn, DynamicTable, toRows } from "@/features/lyceum/components/academic-data";

// ponytail: Lyceum não expõe endpoint de períodos — o filtro é derivado localmente.
// Por padrão acha uma coluna cujos valores batem "AAAA.S" (ex.: 2024.1); quando os
// dados têm ano/semestre em colunas separadas (ex.: Frequencias), passe periodColumns
// para combiná-las em "AAAA.S" só para fins de filtro.
export function FilterablePeriodTable({
  data,
  emptyLabel,
  excludeKeys = [],
  allPeriodsLabel,
  periodColumns,
}: {
  data: unknown;
  emptyLabel: string;
  excludeKeys?: string[];
  allPeriodsLabel: string;
  periodColumns?: { yearKey: string; semesterKey: string };
}) {
  const rows = toRows(data);
  const autoColumn = periodColumns ? null : detectPeriodColumn(rows);

  function periodOf(row: Record<string, unknown>): string | null {
    if (periodColumns) {
      const year = row[periodColumns.yearKey];
      const semester = row[periodColumns.semesterKey];
      return year == null || semester == null ? null : `${year}.${semester}`;
    }
    return autoColumn ? String(row[autoColumn]) : null;
  }

  const periods = Array.from(new Set(rows.map(periodOf).filter((value): value is string => value != null))).sort((a, b) =>
    b.localeCompare(a)
  );
  const [period, setPeriod] = useState("all");

  const filtered = periods.length > 0 && period !== "all" ? rows.filter((row) => periodOf(row) === period) : rows;

  return (
    <div className="flex flex-col gap-2">
      {periods.length > 0 && (
        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className="w-fit rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
        >
          <option value="all">{allPeriodsLabel}</option>
          {periods.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      )}
      <DynamicTable data={filtered} emptyLabel={emptyLabel} excludeKeys={excludeKeys} />
    </div>
  );
}
