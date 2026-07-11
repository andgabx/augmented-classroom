"use client";

import { useState } from "react";
import { detectPeriodColumn, toRows } from "@/features/lyceum/components/academic-data";
import { DynamicTable } from "@/features/lyceum/components/dynamic-table";
import { StaggeredSelect, StaggeredSelectItem } from "@/components/ui/staggered-select";

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

  // ponytail: quando ano/semestre vêm em colunas separadas, mostra "AAAA.S" concatenado
  // na tabela em vez das duas colunas cruas — mesma junção já usada para o filtro.
  const displayRows = periodColumns
    ? filtered.map((row) => {
        const { [periodColumns.yearKey]: year, [periodColumns.semesterKey]: semester, ...rest } = row;
        return { periodo: year != null && semester != null ? `${year}.${semester}` : null, ...rest };
      })
    : filtered;

  return (
    <div className="flex flex-col gap-2">
      {periods.length > 0 && (
        <StaggeredSelect value={period} onValueChange={setPeriod}>
          <StaggeredSelectItem value="all">{allPeriodsLabel}</StaggeredSelectItem>
          {periods.map((p) => (
            <StaggeredSelectItem key={p} value={p}>
              {p}
            </StaggeredSelectItem>
          ))}
        </StaggeredSelect>
      )}
      <DynamicTable data={displayRows} emptyLabel={emptyLabel} excludeKeys={excludeKeys} />
    </div>
  );
}
