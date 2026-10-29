export type SlangWord = {
  word: string;
  meaning: string;
  example: string;
  /** 큰 분류로만 적는다(SNS, 커뮤니티, 메신저) */
  usedAt: string;
};

export const SLANG_PAGE_SIZE = 5;

/**
 * 사람이 고른 신조어 목록. 욕설, 비하, 혐오, 선정적인 표현은 넣지 않는다.
 * 어디서 가져와 어떻게 거를지는 spec 의 미결정이라, 정해질 때까지 이 목록을 쓴다.
 */
const SLANG: SlangWord[] = [
  { word: "갓생", meaning: "부지런하고 알차게 계획한 대로 사는 생활을 뜻해요.", example: "이번 달은 아침 운동으로 갓생 살아보려고.", usedAt: "SNS" },
  { word: "중꺾마", meaning: "“중요한 것은 꺾이지 않는 마음”의 줄임말이에요.", example: "시험이 어려워도 중꺾마로 끝까지 해보자.", usedAt: "SNS · 커뮤니티" },
  { word: "점메추", meaning: "“점심 메뉴 추천”의 줄임말이에요.", example: "오늘 점메추 부탁해요. 국물 있는 걸로!", usedAt: "커뮤니티 · 메신저" },
  { word: "별다줄", meaning: "“별걸 다 줄인다”의 줄임말로, 뭐든 줄여 부르는 말투를 가리켜요.", example: "점메추에 알잘딱깔센까지, 정말 별다줄이네.", usedAt: "SNS · 커뮤니티" },
  { word: "알잘딱깔센", meaning: "“알아서 잘 딱 깔끔하고 센스 있게”의 줄임말이에요.", example: "발표 자료는 알잘딱깔센으로 부탁해요.", usedAt: "메신저 · 커뮤니티" },
  { word: "만반잘부", meaning: "“만나서 반가워, 잘 부탁해”의 줄임말이에요.", example: "새로 오신 분들 만반잘부!", usedAt: "커뮤니티" },
  { word: "소확행", meaning: "작지만 확실한 행복을 줄여 부르는 말이에요.", example: "퇴근길 붕어빵이 오늘의 소확행.", usedAt: "SNS" },
  { word: "갓벽", meaning: "“God”과 “완벽”을 합쳐, 흠잡을 데 없이 완벽하다는 뜻이에요.", example: "이번 발표 마무리 갓벽했어.", usedAt: "SNS" },
  { word: "득템", meaning: "좋은 물건을 얻었다는 뜻이에요.", example: "중고 장터에서 책상 득템했어요.", usedAt: "커뮤니티" },
  { word: "심쿵", meaning: "마음이 설레서 가슴이 뛰는 느낌을 말해요.", example: "뜻밖의 칭찬에 심쿵했어요.", usedAt: "SNS · 메신저" },
];

export function slangPageCount() {
  return Math.ceil(SLANG.length / SLANG_PAGE_SIZE);
}

/** 쪽 번호는 끝에서 처음으로, 처음에서 끝으로 이어진다. */
export function getSlangPage(page: number): SlangWord[] {
  const count = slangPageCount();
  const index = ((page % count) + count) % count;
  return SLANG.slice(index * SLANG_PAGE_SIZE, (index + 1) * SLANG_PAGE_SIZE);
}
