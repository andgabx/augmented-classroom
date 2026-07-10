import Link from "next/link";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data.filter(isRecord);
  if (isRecord(data)) return [data];
  return [];
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[_\s]/g, "");
}

function formatLabel(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

function isEpochMillis(value: unknown): value is number {
  return typeof value === "number" && value > 1e11;
}

// ponytail: boletim/disciplinasBoletim trazem "periodo" ({ano,semestre}) e arrays
// como "faltas"/"provas" — em vez de JSON.stringify cru, achata recursivamente em texto.
function formatValue(value: unknown, key?: string): string {
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

// ponytail: shape das respostas do Lyceum não é documentada — renderiza colunas/labels
// dinamicamente a partir do JSON em vez de supor nomes de campo.
export function DynamicTable({
  data,
  emptyLabel,
  excludeKeys = [],
  excludePattern,
}: {
  data: unknown;
  emptyLabel: string;
  excludeKeys?: string[];
  excludePattern?: RegExp;
}) {
  const rows = toRows(data);
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;

  const excluded = new Set(excludeKeys.map(normalizeKey));
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row)))).filter(
    (col) => !excluded.has(normalizeKey(col)) && !excludePattern?.test(col)
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-medium text-muted-foreground">
                {formatLabel(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-border last:border-0">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 text-foreground">
                  {formatValue(row[col], col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PERIOD_PATTERN = /^\d{4}\.[12]$/;

export function detectPeriodColumn(rows: Record<string, unknown>[]): string | null {
  const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return columns.find((col) => rows.some((row) => typeof row[col] === "string" && PERIOD_PATTERN.test(row[col]))) ?? null;
}

export { toRows };

export function KeyValuePanel({
  data,
  emptyLabel,
  excludeKeys = [],
}: {
  data: unknown;
  emptyLabel: string;
  excludeKeys?: string[];
}) {
  if (!isRecord(data)) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;

  const excluded = new Set(excludeKeys.map(normalizeKey));
  const entries = Object.entries(data).filter(([key]) => !excluded.has(normalizeKey(key)));

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-2xl border border-border bg-card p-4 text-sm sm:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col gap-0.5">
          <dt className="text-xs text-muted-foreground">{formatLabel(key)}</dt>
          <dd className="font-medium text-foreground">{formatValue(value, key)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LyceumSessionExpiredNotice({ message, reconnectLabel }: { message: string; reconnectLabel: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
      <p className="text-sm text-foreground">{message}</p>
      <Link href="/settings" className="self-start text-sm font-medium text-foreground underline">
        {reconnectLabel}
      </Link>
    </div>
  );
}
