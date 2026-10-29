import type { CategoryId } from "./categories";

export type Article = {
  /** 구글 뉴스가 준 링크. 누르면 구글이 실제 기사로 넘겨준다. */
  link: string;
  title: string;
  source: string;
  /** ISO 8601 */
  publishedAt: string;
};

export type Keyword = {
  keyword: string;
  /** 헤드라인에 이 키워드가 나온 기사 수 */
  count: number;
  /** 카테고리 안 순위(1부터) */
  rank: number;
};

export type CategorySnapshot = {
  id: CategoryId;
  name: string;
  articleCount: number;
  keywords: Keyword[];
  /** 구글 뉴스에서 이 카테고리를 불러오지 못했는지 */
  failed: boolean;
};

export type KeywordMap = {
  /** 가장 최근에 뉴스를 모은 시각(ISO 8601) */
  updatedAt: string;
  categories: CategorySnapshot[];
};
