import { CATEGORIES, searchWords } from "./categories";
import { fetchFeed } from "./feed";
import { extractKeywords } from "./keywords";
import type { Article, CategorySnapshot, KeywordMap } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
export const WINDOW_DAYS = 14;

/** 카테고리 하나의 최근 2주 기사를 최신순으로 모은다. 같은 제목은 한 번만 센다. */
export async function collectArticles(
  query: string,
  now: Date,
): Promise<{ articles: Article[]; collectedAt: Date | null }> {
  const since = now.getTime() - WINDOW_DAYS * DAY_MS;
  const seen = new Set<string>();
  const feed = await fetchFeed(query);
  const articles = feed.articles
    .filter((a) => new Date(a.publishedAt).getTime() >= since)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter((a) => (seen.has(a.title) ? false : (seen.add(a.title), true)));
  return { articles, collectedAt: feed.collectedAt };
}

/** 모은 시각 중 가장 오래된 것. 화면의 기준 시각은 가장 덜 새로운 카테고리에 맞춘다. */
export function oldestCollectedAt(times: (Date | null)[], fallback: Date) {
  const known = times.filter((t): t is Date => t !== null);
  return known.length === 0 ? fallback : new Date(Math.min(...known.map((t) => t.getTime())));
}

export async function getKeywordMap({ now = new Date() }: { now?: Date } = {}): Promise<KeywordMap> {
  const results = await Promise.allSettled(CATEGORIES.map((c) => collectArticles(c.query, now)));
  // 전부 실패한 결과를 화면으로 만들면 12시간 캐시에 남아 이전에 모은 키워드를 덮어쓴다. 오류로 넘겨 이전 결과를 지킨다.
  if (results.every((r) => r.status === "rejected")) {
    throw new Error("구글 뉴스에서 어떤 카테고리도 불러오지 못했어요.");
  }
  const categories: CategorySnapshot[] = CATEGORIES.map((category, i) => {
    const result = results[i];
    const articles = result.status === "fulfilled" ? result.value.articles : [];
    return {
      id: category.id,
      name: category.name,
      articleCount: articles.length,
      keywords: extractKeywords(articles, searchWords(category)),
      failed: result.status === "rejected",
    };
  });
  const times = results.map((r) => (r.status === "fulfilled" ? r.value.collectedAt : null));
  return { updatedAt: oldestCollectedAt(times, now).toISOString(), categories };
}
