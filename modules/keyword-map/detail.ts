import { CATEGORIES, findCategory } from "./categories";
import { collectAll, WINDOW_DAYS } from "./snapshot";
import { tokenize } from "./tokens";
import type { Article, Keyword } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const CO_KEYWORD_LIMIT = 5;

export type KeywordDetail = {
  categoryId: string;
  categoryName: string;
  keyword: string;
  rank: number;
  /** 이 키워드가 헤드라인에 나온 기사, 최신순. keywords 는 그 헤드라인에 나온 이 카테고리의 키워드(이 키워드가 맨 앞) */
  articles: (Article & { keywords: string[] })[];
  /** 최근 2주의 하루별 기사 수. 오래된 날부터 오늘까지 14칸 */
  dailyCounts: number[];
  /** 같은 헤드라인에 함께 나온 같은 카테고리 키워드 */
  coKeywords: { keyword: string; count: number }[];
};

function kstDayNumber(ms: number) {
  return Math.floor((ms + KST_OFFSET_MS) / DAY_MS);
}

export async function getKeywordDetail(
  categoryId: string,
  keyword: string,
  { now = new Date() }: { now?: Date } = {},
): Promise<KeywordDetail | null> {
  const category = findCategory(categoryId);
  if (!category) return null;

  const { results, ranked, inputs } = await collectAll(now);
  const index = CATEGORIES.findIndex((c) => c.id === category.id);
  const failure = results[index];
  if (failure.status === "rejected") throw failure.reason;
  const all = inputs[index].articles;
  const keywords: Keyword[] = ranked.get(category.id) ?? [];
  const found = keywords.find((k) => k.keyword === keyword);
  if (!found) return null;

  const tokensOf = new Map(all.map((a) => [a, new Set(tokenize(a.title))]));
  const matched = all.filter((a) => tokensOf.get(a)!.has(keyword));

  const today = kstDayNumber(now.getTime());
  const dailyCounts = Array<number>(WINDOW_DAYS).fill(0);
  for (const article of matched) {
    const ago = today - kstDayNumber(new Date(article.publishedAt).getTime());
    if (ago >= 0 && ago < WINDOW_DAYS) dailyCounts[WINDOW_DAYS - 1 - ago] += 1;
  }

  const coKeywords = keywords
    .filter((k) => k.keyword !== keyword)
    .map((k) => ({
      keyword: k.keyword,
      count: matched.filter((a) => tokensOf.get(a)!.has(k.keyword)).length,
    }))
    .filter((k) => k.count > 0)
    .sort((a, b) => b.count - a.count) // 정렬이 안정적이라 같은 건수는 키워드 순위순으로 남는다
    .slice(0, CO_KEYWORD_LIMIT);

  return {
    categoryId: category.id,
    categoryName: category.name,
    keyword,
    rank: found.rank,
    articles: matched.map((a) => ({
      ...a,
      keywords: [
        keyword,
        ...keywords.filter((k) => k.keyword !== keyword && tokensOf.get(a)!.has(k.keyword)).map((k) => k.keyword),
      ],
    })),
    dailyCounts,
    coKeywords,
  };
}
