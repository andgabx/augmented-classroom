"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Languages } from "lucide-react";
import { StaggeredDropdown, StaggeredDropdownItem } from "@/components/ui/staggered-dropdown";
import { setUserLocale, type Locale } from "@/i18n/locale";

const LOCALES: { value: Locale; labelKey: "portuguese" | "english" | "spanish" | "german" }[] = [
  { value: "pt", labelKey: "portuguese" },
  { value: "en", labelKey: "english" },
  { value: "es", labelKey: "spanish" },
  { value: "de", labelKey: "german" },
];

export function LanguageDropdown() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function select(next: Locale) {
    if (next === locale || isPending) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  }

  return (
    <StaggeredDropdown
      side="bottom"
      align="end"
      trigger={
        <span
          aria-label={t("language")}
          className="flex size-7 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <Languages className="size-4" />
        </span>
      }
      contentClassName="w-36"
    >
      {LOCALES.map(({ value, labelKey }) => (
        <StaggeredDropdownItem
          key={value}
          onClick={() => select(value)}
          className={value === locale ? "font-semibold text-foreground" : "text-muted-foreground"}
        >
          {t(labelKey)}
        </StaggeredDropdownItem>
      ))}
    </StaggeredDropdown>
  );
}
