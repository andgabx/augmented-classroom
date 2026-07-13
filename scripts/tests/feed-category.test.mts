import assert from "node:assert/strict";
import { deriveFeedCategory, feedCategoryToPostCategories } from "../../src/features/feed/types/feed-category.ts";

assert.equal(deriveFeedCategory("TAREFA", "ASSIGNMENT"), "TAREFA");
assert.equal(deriveFeedCategory("TAREFA", null), "TAREFA");
assert.equal(deriveFeedCategory("TAREFA", "SHORT_ANSWER_QUESTION"), "PERGUNTA");
assert.equal(deriveFeedCategory("TAREFA", "MULTIPLE_CHOICE_QUESTION"), "PERGUNTA");
assert.equal(deriveFeedCategory("MATERIAL", null), "MATERIAL");
assert.equal(deriveFeedCategory("AVISO", null), "AVISO");

assert.deepEqual(feedCategoryToPostCategories(["TAREFA", "PERGUNTA"]), ["TAREFA"]);
assert.deepEqual(feedCategoryToPostCategories(["MATERIAL", "AVISO"]), ["MATERIAL", "AVISO"]);

console.log("feed-category: OK");
