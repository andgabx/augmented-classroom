"use client";

import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function DownloadAllButton({
  action,
  courseName,
  count,
}: {
  action: () => Promise<void>;
  courseName: string;
  count: number;
}) {
  const t = useTranslations("downloads");

  return (
    <form action={action}>
      <Button
        type="submit"
        size="sm"
        disabled={count === 0}
        onClick={() => toast.success(t("downloadingToast", { count, courseName }))}
      >
        {t("downloadCount", { count })}
      </Button>
    </form>
  );
}
