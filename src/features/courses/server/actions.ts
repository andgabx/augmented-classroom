"use server";

import { revalidatePath } from "next/cache";
import { setCoursePeriod, syncCourses } from "@/features/courses/server/courses";
import { getCallbackRedirectUri } from "@/lib/redirect-uri";

export async function syncCoursesAction() {
  await syncCourses(await getCallbackRedirectUri());
  revalidatePath("/courses");
}

export async function setCoursePeriodAction(courseId: string, formData: FormData) {
  const periodName = String(formData.get("periodName") ?? "");
  setCoursePeriod(courseId, periodName);
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
}
