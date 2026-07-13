"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { syncDeadlinesAction, type SyncDeadlinesState } from "@/features/deadlines/server/actions";

const initialState: SyncDeadlinesState = { success: false, message: "" };

export function SyncDeadlinesButton() {
  const t = useTranslations("deadlines");
  const [state, formAction, pending] = useActionState(syncDeadlinesAction, initialState);

  useEffect(() => {
    if (!state.message) return;
    if (state.success) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? t("syncing") : t("sync")}
      </Button>
    </form>
  );
}
