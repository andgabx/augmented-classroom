"use client";

import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { clearDownloadsAction } from "@/features/downloads/server/actions";

export function ClearDownloadsButton() {
  const t = useTranslations("downloads");

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        <Trash2 />
        {t("clear")}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("clearTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("clearDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("clearCancel")}</AlertDialogCancel>
          <form action={clearDownloadsAction}>
            <AlertDialogAction type="submit" variant="destructive">
              {t("clearConfirm")}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
