export const COURSE_TABS = ["documentos", "prazos"] as const;
export type CourseTab = (typeof COURSE_TABS)[number];

export function courseTabFromSearchParams(tab: string | undefined): CourseTab {
  return tab === "prazos" ? "prazos" : "documentos";
}
