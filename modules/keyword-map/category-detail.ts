import { findCategory, searchWords } from "./categories";
import { extractKeywords } from "./keywords";
import { collectArticles, oldestCollectedAt } from "./snapshot";
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

  const { articles, collectedAt } = await collectArticles(category.query, now);
  const keywords = extractKeywords(articles, searchWords(category)).map((k) => ({
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
