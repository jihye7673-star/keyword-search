/** 서비스가 보여주는 뉴스 카테고리. 순서가 곧 화면 순서이고, query 는 구글 뉴스 검색어다. */
export const CATEGORIES = [
  { id: "politics", name: "정치", query: "정치" },
  { id: "economy", name: "경제", query: "경제" },
  { id: "society", name: "사회", query: "사회" },
  { id: "world", name: "세계", query: "세계" },
  { id: "culture", name: "문화", query: "문화" },
  { id: "it-science", name: "IT/과학", query: "IT 과학" },
  { id: "sports", name: "스포츠", query: "스포츠" },
  { id: "weather", name: "날씨", query: "날씨" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function findCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}

/** 카테고리를 모으려고 쓴 검색어의 낱말. 기사마다 들어 있어 키워드로는 의미가 없다. */
export function searchWords(category: { query: string }) {
  return category.query.split(" ");
}

/** 모든 카테고리의 검색어 낱말. 어느 카테고리에서도 키워드로 뽑지 않는다. */
export function allSearchWords() {
  return [...new Set(CATEGORIES.flatMap((c) => searchWords(c)))];
}
