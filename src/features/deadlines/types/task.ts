export interface Task {
  id: string;
  courseId: string;
  courseName: string;
  title: string | null;
  description: string | null;
  alternateLink: string;
  dueDate: string;
  late: boolean;
  submissionState: string | null;
}
