/** 서비스가 보여주는 뉴스 카테고리. 순서가 곧 화면 순서이고, query 는 구글 뉴스 검색어다. */
export const CATEGORIES = [
  { id: "politics", name: "정치", query: "정치" },
  { id: "economy", name: "경제", query: "경제" },
  // 이름으로 검색하면 "지역사회", "세무사회"처럼 이름이 든 낱말이 모이므로 분야의 주제 낱말로 모은다.
  { id: "society", name: "사회", query: "경찰 OR 법원 OR 사건 OR 사고 OR 교육 OR 복지 OR 노동 OR 환경" },
  // "세계"로 검색하면 제목에 그 글자가 든 기사("세계 1위", "전 세계")가 모여 국제 뉴스가 아니다.
  { id: "world", name: "세계", query: "국제 OR 해외 OR 외신 OR 미국 OR 중국 OR 일본 OR 유럽 OR 러시아 OR 중동" },
  { id: "culture", name: "문화", query: "영화 OR 드라마 OR 공연 OR 전시 OR 음악 OR 방송 OR 도서 OR 웹툰" },
  { id: "it-science", name: "IT/과학", query: "IT 과학" },
  { id: "sports", name: "스포츠", query: "프로야구 OR 축구 OR 농구 OR 배구 OR K리그 OR KBO OR 월드컵" },
  { id: "weather", name: "날씨", query: "날씨" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function findCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id);
}

/** 카테고리를 모으려고 쓴 검색어의 낱말. 기사마다 들어 있어 키워드로는 의미가 없다(검색 연산자 OR 은 낱말이 아니다). */
export function searchWords(category: { query: string }) {
  return category.query.split(" ").filter((word) => word !== "OR");
}

/** 모든 카테고리의 검색어 낱말. 어느 카테고리에서도 키워드로 뽑지 않는다. */
export function allSearchWords() {
  return [...new Set(CATEGORIES.flatMap((c) => searchWords(c)))];
}
