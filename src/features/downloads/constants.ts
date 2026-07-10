import type { DownloadStatus } from "@/features/downloads/types/download";

export const DOWNLOAD_STATUS_LABEL: Record<DownloadStatus, string> = {
  QUEUED: "Na fila",
  DOWNLOADING: "Baixando...",
  DONE: "Baixado ✓",
  ERROR: "Erro",
};
