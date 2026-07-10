import { NextResponse } from "next/server";
import { listAllDownloads } from "@/features/downloads/server/downloads";

export async function GET() {
  return NextResponse.json({ downloads: listAllDownloads() });
}
