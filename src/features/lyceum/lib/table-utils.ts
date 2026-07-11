function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function toRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter(isRecord);
  if (isRecord(data)) return [data];
  return [];
}

export function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[_\s]/g, "");
}

export function formatLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isEpochMillis(value: unknown): value is number {
  return typeof value === "number" && value > 1e11;
}

// ponytail: boletim/disciplinasBoletim trazem "periodo" ({ano,semestre}) e arrays
// como "faltas"/"provas" — em vez de JSON.stringify cru, achata recursivamente em texto.
export function formatValue(value: unknown, key?: string): string {
  if (value == null || value === "") return "—";
  if (key && /^dt_/i.test(key) && isEpochMillis(value)) {
    return new Date(value).toLocaleDateString("pt-BR");
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? "—" : value.map((item) => formatValue(item)).join("; ");
  }
  if (isRecord(value)) {
    if (typeof value.ano === "number" && typeof value.semestre === "number") {
      return `${value.ano}.${value.semestre}`;
    }
    const entries = Object.entries(value).filter(([, v]) => v != null && v !== "");
    return entries.length === 0 ? "—" : entries.map(([k, v]) => `${formatLabel(k)}: ${formatValue(v, k)}`).join(", ");
  }
  return String(value);
}

// campos que o Lyceum sempre inclui mas não têm valor de leitura para o aluno
export const COMMON_EXCLUDED_FIELDS = ["aluno", "disciplina", "orderSerie", "serie", "creditos"];

const PERIOD_PATTERN = /^\d{4}\.[12]$/;

export function detectPeriodColumn(rows: Record<string, unknown>[]): string | null {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return columns.find((col) => rows.some((row) => typeof row[col] === "string" && PERIOD_PATTERN.test(row[col]))) ?? null;
}
