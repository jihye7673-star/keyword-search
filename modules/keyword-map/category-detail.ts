import { CATEGORIES, findCategory } from "./categories";
import { collectAll, oldestCollectedAt } from "./snapshot";
import { tokenize } from "./tokens";
import type { Article, Keyword } from "./types";

export type CategoryDetail = {
  id: string;
  name: string;
  articleCount: number;
  updatedAt: string;
  keywords: (Keyword & { latest: Article })[];
};

export async function getCategoryDetail(
  categoryId: string,
  { now = new Date() }: { now?: Date } = {},
): Promise<CategoryDetail | null> {
  const category = findCategory(categoryId);
  if (!category) return null;

  const { results, ranked, inputs } = await collectAll(now);
  const index = CATEGORIES.findIndex((c) => c.id === category.id);
  const result = results[index];
  if (result.status === "rejected") throw result.reason;
  const articles = inputs[index].articles;
  const collectedAt = result.value.collectedAt;
  const keywords = (ranked.get(category.id) ?? []).map((k) => ({
    ...k,
    // 기사는 최신순이라 처음 만나는 기사가 가장 최근 대표 기사다.
    latest: articles.find((a) => tokenize(a.title).includes(k.keyword))!,
  }));

  return {
    id: category.id,
    name: category.name,
    articleCount: articles.length,
    updatedAt: oldestCollectedAt([collectedAt], now).toISOString(),
    keywords,
  };
}
