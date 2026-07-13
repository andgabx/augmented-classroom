import type { PostCategory } from "@/features/materials/types/post";

export type FeedCategory = "TAREFA" | "PERGUNTA" | "MATERIAL" | "AVISO";

const QUESTION_WORK_TYPES = new Set(["SHORT_ANSWER_QUESTION", "MULTIPLE_CHOICE_QUESTION"]);

export function deriveFeedCategory(category: PostCategory, workType: string | null): FeedCategory {
  if (category === "TAREFA" && workType && QUESTION_WORK_TYPES.has(workType)) return "PERGUNTA";
  return category;
}

export function feedCategoryToPostCategories(feedCategories: FeedCategory[]): PostCategory[] {
  const categories = new Set<PostCategory>();
  for (const feedCategory of feedCategories) {
    categories.add(feedCategory === "PERGUNTA" ? "TAREFA" : feedCategory);
  }
  return [...categories];
}
