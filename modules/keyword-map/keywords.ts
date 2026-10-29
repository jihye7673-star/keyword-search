import { tokenize } from "./tokens";
import type { Article, Keyword } from "./types";

export const KEYWORDS_PER_CATEGORY = 7;

/**
 * 최신 기사가 앞에 있는 목록에서, 여러 헤드라인에 나온 단어를 많이 나온 순서로 고른다.
 * excluded 에 든 말(카테고리 이름처럼 검색어 자체)은 키워드로 뽑지 않는다.
 */
export function extractKeywords(articles: Article[], excluded: readonly string[] = []): Keyword[] {
  const skip = new Set(excluded);
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const token of new Set(tokenize(article.title))) {
      if (skip.has(token)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  // Map 은 처음 나온 순서를 지켜 주므로, 같은 횟수면 더 최근 기사의 단어가 앞에 온다.
  const ranked = [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, KEYWORDS_PER_CATEGORY);
  return ranked.map(([keyword, count], i) => ({ keyword, count, rank: i + 1 }));
}
