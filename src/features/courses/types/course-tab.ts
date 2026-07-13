export const COURSE_TABS = ["feed", "documentos", "prazos"] as const;
export type CourseTab = (typeof COURSE_TABS)[number];

export function courseTabFromSearchParams(tab: string | undefined): CourseTab {
  if (tab === "documentos" || tab === "prazos") return tab;
  return "feed";
}
