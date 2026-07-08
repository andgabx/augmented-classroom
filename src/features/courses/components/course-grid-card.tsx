import Link from "next/link";
import { GraduationCap } from "lucide-react";
import type { Course } from "@/features/courses/types/course";

export function CourseGridCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.id}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:bg-muted"
    >
      <div className="flex aspect-video items-center justify-center bg-sidebar-primary/10">
        <GraduationCap className="size-8 text-sidebar-primary" />
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span className="line-clamp-2 text-sm font-medium text-foreground">{course.name}</span>
        {course.section && (
          <span className="text-xs text-muted-foreground">{course.section}</span>
        )}
      </div>
    </Link>
  );
}
