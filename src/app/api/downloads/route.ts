import { NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { listAllDownloads } from "@/features/downloads/server/downloads";

export async function GET() {
  const t = await getTranslations("materials");
  return NextResponse.json({ downloads: listAllDownloads(t("untitled")) });
}
