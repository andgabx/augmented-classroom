import { isOverdue } from "@/features/deadlines/lib/format-due";
import type { Task } from "@/features/deadlines/types/task";

export type TaskStatus = "PENDING" | "MISSING" | "TURNED_IN" | "TURNED_IN_LATE";

export const DEFAULT_TASK_STATUSES: TaskStatus[] = ["PENDING", "MISSING"];

export function getTaskStatus(task: Pick<Task, "dueDate" | "late" | "submissionState">): TaskStatus {
  const turnedIn = task.submissionState === "TURNED_IN" || task.submissionState === "RETURNED";
  if (turnedIn) return task.late ? "TURNED_IN_LATE" : "TURNED_IN";
  return isOverdue(task.dueDate) ? "MISSING" : "PENDING";
}
