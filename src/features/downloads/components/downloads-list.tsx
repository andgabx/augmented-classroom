"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DOWNLOAD_STATUS_KEY } from "@/features/downloads/constants";
import type { DownloadListItem } from "@/features/downloads/types/download";

const POLL_INTERVAL_MS = 2000;

export function DownloadsList({ initialDownloads }: { initialDownloads: DownloadListItem[] }) {
  const tStatus = useTranslations("downloads.status");
  const [downloads, setDownloads] = useState(initialDownloads);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/downloads");
      const { downloads: latest } = await res.json();
      setDownloads(latest);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  if (downloads.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum download em andamento.</p>;
  }

  const byCourse = new Map<string, { courseName: string; items: DownloadListItem[] }>();
  for (const item of downloads) {
    const group = byCourse.get(item.courseId) ?? { courseName: item.courseName, items: [] };
    group.items.push(item);
    byCourse.set(item.courseId, group);
  }

  return (
    <div className="flex flex-col gap-6">
      {Array.from(byCourse.values()).map((group) => (
        <section key={group.courseName} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground">{group.courseName}</h2>
          <div className="flex flex-col gap-2">
            {group.items.map((item) => (
              <div
                key={item.materialId}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
              >
                <span className="font-medium text-foreground">{item.materialLabel}</span>
                <span className="text-sm text-muted-foreground">
                  {tStatus(DOWNLOAD_STATUS_KEY[item.status])}
                  {item.status === "DOWNLOADING" && item.attempts > 1 && ` (tentativa ${item.attempts})`}
                  {item.status === "ERROR" && item.errorMessage && ` — ${item.errorMessage}`}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
