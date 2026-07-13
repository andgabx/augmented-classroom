import type { Material } from "@/features/materials/types/post";
import type { FeedCategory } from "@/features/feed/types/feed-category";

export interface FeedPost {
  id: string;
  courseId: string;
  courseName: string;
  feedCategory: FeedCategory;
  title: string | null;
  text: string | null;
  alternateLink: string;
  creationTime: string | null;
  attachments: Material[];
}
