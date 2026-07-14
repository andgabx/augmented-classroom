"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { setUserLocale, type Locale } from "@/i18n/locale";
import { Button } from "@/components/ui/button";

const LOCALES: { value: Locale; labelKey: "portuguese" | "english" | "spanish" | "german" }[] = [
  { value: "pt", labelKey: "portuguese" },
  { value: "en", labelKey: "english" },
  { value: "es", labelKey: "spanish" },
  { value: "de", labelKey: "german" },
];

export function LanguagePicker() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  function select(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {LOCALES.map(({ value, labelKey }) => (
        <Button
          key={value}
          type="button"
          variant={value === locale ? "default" : "outline"}
          size="sm"
          disabled={isPending}
          onClick={() => select(value)}
        >
          {t(labelKey)}
        </Button>
      ))}
    </div>
  );
}
