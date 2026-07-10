import type { DownloadStatus } from "@/features/downloads/types/download";

export const DOWNLOAD_STATUS_KEY: Record<DownloadStatus, "queued" | "downloading" | "done" | "error"> = {
  QUEUED: "queued",
  DOWNLOADING: "downloading",
  DONE: "done",
  ERROR: "error",
};
