"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { COURSE_TABS, type CourseTab } from "@/features/courses/types/course-tab";

const TAB_LABEL_KEY: Record<CourseTab, "tabFeed" | "tabDocumentos" | "tabPrazos"> = {
  feed: "tabFeed",
  documentos: "tabDocumentos",
  prazos: "tabPrazos",
};

export function CourseTabs({ active }: { active: CourseTab }) {
  const t = useTranslations("courses");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goTo(tab: CourseTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "feed") params.delete("tab");
    else params.set("tab", tab);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="flex gap-1 border-b border-border">
      {COURSE_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => goTo(tab)}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            active === tab
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t(TAB_LABEL_KEY[tab])}
        </button>
      ))}
    </div>
  );
}
