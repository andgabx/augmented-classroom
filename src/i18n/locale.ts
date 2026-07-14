"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type Locale = "pt" | "en" | "es" | "de";

const LOCALES: Locale[] = ["pt", "en", "es", "de"];
const COOKIE_NAME = "locale";
const DEFAULT_LOCALE: Locale = "pt";

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

export async function setUserLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale);
  revalidatePath("/", "layout");
}
