export type DownloadStatus = "QUEUED" | "DOWNLOADING" | "DONE" | "ERROR";

export interface Download {
  materialId: string;
  status: DownloadStatus;
  localPath: string | null;
  errorMessage: string | null;
  attempts: number;
  updatedAt: string;
}
