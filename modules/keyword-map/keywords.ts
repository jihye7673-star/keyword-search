import { tokenize } from "./tokens";
import type { Article, Keyword } from "./types";

export const KEYWORDS_PER_CATEGORY = 7;
/** 키워드가 되려면 서로 다른 언론사 몇 곳 이상의 헤드라인에 나와야 하는지 */
export const MIN_SOURCES = 2;
/** 키워드가 되려면 헤드라인 몇 건 이상에 나와야 하는지 */
export const MIN_ARTICLES = 2;

export type CategoryArticles = { id: string; articles: Article[] };

type Stat = { count: number; sources: Set<string> };

/**
 * 기사 내용을 대표하는 키워드만 카테고리마다 고른다. 키워드가 되는 조건:
 * 1. 여러 헤드라인(MIN_ARTICLES건 이상)에 나온다.
 * 2. 서로 다른 언론사(MIN_SOURCES곳 이상)의 헤드라인에 나온다. 한 곳의 반복 보도로는 대표성이 없다.
 * 3. 가장 많이 다뤄진 한 카테고리에서만 키워드가 된다. 여러 분야에 두루 쓰이는 말(AI, 대통령 등)이
 *    모든 카테고리를 차지하지 않게 한다. 동률이면 앞선 카테고리에 속한다.
 * 4. 일반적인 말과 excluded(검색어)는 후보에서 뺀다(tokenize 와 excluded).
 * 각 목록은 많이 나온 순서이고, 같은 횟수면 더 최근 기사의 단어가 앞에 온다.
 */
export function rankKeywords(
  categories: CategoryArticles[],
  excluded: readonly string[] = [],
): Map<string, Keyword[]> {
  const skip = new Set(excluded);
  const stats = categories.map(({ articles }) => {
    const map = new Map<string, Stat>();
    for (const article of articles) {
      for (const token of new Set(tokenize(article.title))) {
        if (skip.has(token)) continue;
        const stat = map.get(token) ?? { count: 0, sources: new Set<string>() };
        stat.count += 1;
        stat.sources.add(article.source);
        map.set(token, stat);
      }
    }
    return map;
  });

  const home = new Map<string, number>();
  stats.forEach((map, i) => {
    for (const [token, stat] of map) {
      const current = home.get(token);
      if (current === undefined || stat.count > stats[current].get(token)!.count) home.set(token, i);
    }
  });

  return new Map(
    categories.map(({ id }, i) => {
      const ranked = [...stats[i].entries()]
        .filter(([token, s]) => s.count >= MIN_ARTICLES && s.sources.size >= MIN_SOURCES && home.get(token) === i)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, KEYWORDS_PER_CATEGORY);
      return [id, ranked.map(([keyword, s], rank) => ({ keyword, count: s.count, rank: rank + 1 }))];
    }),
  );
}
