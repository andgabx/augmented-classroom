"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { StaggeredSelect, StaggeredSelectItem } from "@/components/ui/staggered-select";
import { setCoursePeriodAction, type SetCoursePeriodState } from "@/features/courses/server/actions";

const initialState: SetCoursePeriodState = { success: false, message: "" };

export function PeriodForm({ courseId, periodId }: { courseId: string; periodId: string | null }) {
  const t = useTranslations("courses");
  const [year, term] = periodId?.split(".") ?? ["", "1"];
  const [state, formAction, pending] = useActionState(
    setCoursePeriodAction.bind(null, courseId),
    initialState
  );

  useEffect(() => {
    if (!state.message) return;
    if (state.success) toast.success(state.message);
    else toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex items-center gap-2 pt-1">
      <StaggeredSelect name="term" defaultValue={term} triggerClassName="text-xs">
        <StaggeredSelectItem value="1">{t("termFirstSemester")}</StaggeredSelectItem>
        <StaggeredSelectItem value="2">{t("termSecondSemester")}</StaggeredSelectItem>
      </StaggeredSelect>
      <input
        type="number"
        name="year"
        defaultValue={year}
        placeholder={t("yearPlaceholder")}
        className="w-20 rounded-lg bg-card px-3 py-1.5 text-xs text-foreground shadow-sm outline-none transition-shadow focus:shadow-md"
      />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {t("savePeriod")}
      </Button>
    </form>
  );
}
