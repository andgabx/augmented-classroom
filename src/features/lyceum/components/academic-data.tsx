import Link from "next/link";
import { formatLabel, formatValue, normalizeKey } from "@/features/lyceum/lib/table-utils";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export { COMMON_EXCLUDED_FIELDS, detectPeriodColumn, toRows } from "@/features/lyceum/lib/table-utils";

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
    <dl className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-2xl bg-card p-4 text-sm shadow-sm sm:grid-cols-3">
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
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-sm">
      <p className="text-sm text-foreground">{message}</p>
      <Link href="/settings" className="self-start text-sm font-medium text-foreground underline">
        {reconnectLabel}
      </Link>
    </div>
  );
}
