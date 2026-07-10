"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getTranslations } from "next-intl/server";
import { setCoursePeriod, syncCourses } from "@/features/courses/server/courses";
import { getCallbackRedirectUri } from "@/lib/redirect-uri";

export async function syncCoursesAction() {
  await syncCourses(await getCallbackRedirectUri());
  revalidatePath("/courses");
}

const coursePeriodSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  term: z.enum(["1", "2"]),
});

export interface SetCoursePeriodState {
  success: boolean;
  message: string;
}

export async function setCoursePeriodAction(
  courseId: string,
  _prevState: SetCoursePeriodState,
  formData: FormData
): Promise<SetCoursePeriodState> {
  const t = await getTranslations("courses");
  const parsed = coursePeriodSchema.safeParse({
    year: formData.get("year"),
    term: formData.get("term"),
  });
  if (!parsed.success) {
    return { success: false, message: t("periodInvalid") };
  }

  const period = `${parsed.data.year}.${parsed.data.term}`;
  setCoursePeriod(courseId, period);
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  return { success: true, message: t("periodSaved", { period }) };
}
