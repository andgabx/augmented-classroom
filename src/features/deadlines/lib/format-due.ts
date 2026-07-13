export function isOverdue(dueDate: string): boolean {
  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
}

export function formatDue(dueDate: string, locale: string): { label: string; overdue: boolean } {
  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  const absolute = due.toLocaleDateString(locale, { day: "numeric", month: "short" });
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(diffDays, "day");

  return { label: `${absolute} · ${relative}`, overdue: isOverdue(dueDate) };
}
