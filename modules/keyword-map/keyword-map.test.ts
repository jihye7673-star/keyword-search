import { afterEach, describe, expect, it, vi } from "vitest";

import { getCategoryDetail, getKeywordDetail, getKeywordMap } from "@/modules/keyword-map";

const NOW = new Date("2026-10-29T03:00:00Z");

type Item = { title: string; source: string; at: string; id: string };

function rss(items: Item[]) {
  const body = items
    .map(
      (i) =>
        `<item><title>${i.title} - ${i.source}</title>` +
        `<link>https://news.google.com/rss/articles/${i.id}?oc=5</link>` +
        `<guid isPermaLink="false">${i.id}</guid>` +
        `<pubDate>${new Date(i.at).toUTCString()}</pubDate>` +
        `<description></description>` +
        `<source url="https://${i.source}.example">${i.source}</source></item>`,
    )
    .join("");
  return (
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>` +
    `<title>feed</title><lastBuildDate>${NOW.toUTCString()}</lastBuildDate>${body}</channel></rss>`
  );
}

/** 카테고리 검색어(앞부분)별로 응답을 돌려주는 가짜 구글 뉴스 RSS. */
function stubGoogleNews(feeds: Record<string, string>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const q = new URL(String(input)).searchParams.get("q") ?? "";
    const key = Object.keys(feeds).find((k) => q.startsWith(k));
    return new Response(key ? feeds[key] : rss([]), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const economy: Item[] = [
  { id: "e1", title: "코스피 장중 상승 전환", source: "서울일보", at: "2026-10-29T02:00:00Z" },
  { id: "e2", title: "코스피가 사흘째 반등", source: "한빛뉴스", at: "2026-10-28T09:00:00Z" },
  { id: "e3", title: "기준금리 동결 결정", source: "대한경제", at: "2026-10-27T05:00:00Z" },
  { id: "e4", title: "한은 기준금리 동결에 시장 안도", source: "미래신문", at: "2026-10-26T05:00:00Z" },
  { id: "e5", title: "환율 하락 마감", source: "서울일보", at: "2026-10-25T05:00:00Z" },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("키워드 맵", () => {
  it("8개 카테고리를 정해진 순서로 보여준다", async () => {
    stubGoogleNews({});

    const map = await getKeywordMap({ now: NOW });

    expect(map.categories.map((c) => c.name)).toEqual([
      "정치",
      "경제",
      "사회",
      "세계",
      "문화",
      "IT/과학",
      "스포츠",
      "날씨",
    ]);
  });

  it("같은 카테고리의 여러 헤드라인에 나온 단어를 많이 논의된 순서의 키워드로 뽑는다", async () => {
    stubGoogleNews({ 경제: rss(economy) });

    const map = await getKeywordMap({ now: NOW });
    const eco = map.categories.find((c) => c.name === "경제")!;

    expect(eco.articleCount).toBe(5);
    expect(eco.keywords).toEqual([
      { keyword: "코스피", count: 2, rank: 1 },
      { keyword: "기준금리", count: 2, rank: 2 },
      { keyword: "동결", count: 2, rank: 3 },
    ]);
  });

  it("카테고리 이름 자체는 키워드로 뽑지 않는다", async () => {
    stubGoogleNews({
      경제: rss([
        { id: "c1", title: "경제 반등 신호 포착", source: "서울일보", at: "2026-10-29T02:00:00Z" },
        { id: "c2", title: "경제 반등 기대 확산", source: "한빛뉴스", at: "2026-10-28T02:00:00Z" },
      ]),
    });

    const eco = (await getKeywordMap({ now: NOW })).categories.find((c) => c.name === "경제")!;

    expect(eco.keywords.map((k) => k.keyword)).toEqual(["반등"]);
  });

  it("어느 기사에나 있는 일반적인 말과 순위·회차 표현은 키워드로 뽑지 않는다", async () => {
    stubGoogleNews({
      경제: rss([
        { id: "g1", title: "규제 강화 관심 집중 1위", source: "서울일보", at: "2026-10-29T02:00:00Z" },
        { id: "g2", title: "규제 강화 관심 쏠려 1위 차지", source: "한빛뉴스", at: "2026-10-28T02:00:00Z" },
      ]),
    });

    const eco = (await getKeywordMap({ now: NOW })).categories.find((c) => c.name === "경제")!;

    expect(eco.keywords.map((k) => k.keyword)).toEqual(["규제"]);
  });

  it("조사처럼 보이는 글자로 끝나는 낱말(올가을)은 잘라 내지 않는다", async () => {
    stubGoogleNews({
      날씨: rss([
        { id: "w1", title: "올가을 첫 한파 몰려온다", source: "서울일보", at: "2026-10-29T02:00:00Z" },
        { id: "w2", title: "올가을 가장 쌀쌀한 아침", source: "한빛뉴스", at: "2026-10-28T02:00:00Z" },
      ]),
    });

    const weather = (await getKeywordMap({ now: NOW })).categories.find((c) => c.name === "날씨")!;

    expect(weather.keywords.map((k) => k.keyword)).toEqual(["올가을"]);
  });

  it("모든 카테고리를 불러오지 못하면 빈 화면을 만들지 않고 오류로 넘긴다(이전에 모은 결과를 지키려고)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("busy", { status: 503 })));

    await expect(getKeywordMap({ now: NOW })).rejects.toThrow();
  });

  it("기준 시각은 화면을 연 시각이 아니라 뉴스를 실제로 모은 시각이다", async () => {
    const collectedAt = new Date("2026-10-29T00:00:00Z");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(rss(economy), { status: 200, headers: { Date: collectedAt.toUTCString() } })),
    );

    const map = await getKeywordMap({ now: NOW });

    expect(map.updatedAt).toBe(collectedAt.toISOString());
  });

  it("한 카테고리를 불러오지 못해도 나머지 카테고리는 보여주고 실패한 카테고리만 표시한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const q = new URL(String(input)).searchParams.get("q") ?? "";
        if (q.startsWith("경제")) return new Response("busy", { status: 503 });
        return new Response(rss(economy), { status: 200 });
      }),
    );

    const map = await getKeywordMap({ now: NOW });

    expect(map.categories.find((c) => c.name === "경제")).toMatchObject({
      failed: true,
      articleCount: 0,
      keywords: [],
    });
    expect(map.categories.find((c) => c.name === "정치")).toMatchObject({ failed: false });
  });
});

describe("키워드 상세", () => {
  const detailFeed: Item[] = [
    { id: "d1", title: "코스피 하락, 기준금리 부담", source: "서울일보", at: "2026-10-29T02:00:00Z" },
    { id: "d2", title: "코스피 반등 환율 안정", source: "한빛뉴스", at: "2026-10-28T09:00:00Z" },
    { id: "d3", title: "기준금리 동결 환율 변수", source: "대한경제", at: "2026-10-28T08:00:00Z" },
    { id: "d4", title: "기준금리 인하 기대 약화", source: "미래신문", at: "2026-10-20T05:00:00Z" },
    { id: "d5", title: "환율 안정 흐름 지속", source: "서울일보", at: "2026-10-19T05:00:00Z" },
  ];

  it("그 키워드가 헤드라인에 나온 기사를 최신순으로 원문 링크와 함께 보여준다", async () => {
    stubGoogleNews({ 경제: rss(detailFeed) });

    const detail = await getKeywordDetail("economy", "코스피", { now: NOW });

    expect(detail?.articles.map((a) => a.title)).toEqual(["코스피 하락, 기준금리 부담", "코스피 반등 환율 안정"]);
    expect(detail?.articles[0]).toMatchObject({
      source: "서울일보",
      link: "https://news.google.com/rss/articles/d1?oc=5",
    });
  });

  it("기사마다 헤드라인에 함께 나온 이 카테고리의 키워드를 이 키워드부터 보여준다", async () => {
    stubGoogleNews({ 경제: rss(detailFeed) });

    const detail = await getKeywordDetail("economy", "기준금리", { now: NOW });

    expect(detail?.articles.map((a) => a.keywords)).toEqual([
      ["기준금리", "코스피"], // 코스피 하락, 기준금리 부담
      ["기준금리", "환율"], // 기준금리 동결 환율 변수
      ["기준금리"], // 기준금리 인하 기대 약화
    ]);
  });

  it("최근 2주를 하루 단위로 나눠 기사 수를 센다(오늘이 마지막 칸)", async () => {
    stubGoogleNews({ 경제: rss(detailFeed) });

    const detail = await getKeywordDetail("economy", "기준금리", { now: NOW });

    // 한국 시각 기준 오늘은 10/29, 어제는 10/28, 10/20은 9일 전
    expect(detail?.dailyCounts).toHaveLength(14);
    expect(detail?.dailyCounts.at(-1)).toBe(1);
    expect(detail?.dailyCounts.at(-2)).toBe(1);
    expect(detail?.dailyCounts.at(-10)).toBe(1);
    expect(detail?.dailyCounts.reduce((a, b) => a + b, 0)).toBe(3);
  });

  it("같은 헤드라인에 가장 자주 함께 나온 키워드를 건수와 함께 보여준다", async () => {
    stubGoogleNews({ 경제: rss(detailFeed) });

    const detail = await getKeywordDetail("economy", "환율", { now: NOW });

    // 건수가 같으면 카테고리 키워드 순위가 높은 쪽이 먼저(기준금리 1위, 코스피 3위)
    expect(detail?.coKeywords).toEqual([
      { keyword: "안정", count: 2 },
      { keyword: "기준금리", count: 1 },
      { keyword: "코스피", count: 1 },
    ]);
  });

  it("카테고리나 키워드가 없으면 찾지 못했다고 알린다", async () => {
    stubGoogleNews({ 경제: rss(detailFeed) });

    expect(await getKeywordDetail("economy", "없는말", { now: NOW })).toBeNull();
    expect(await getKeywordDetail("nowhere", "코스피", { now: NOW })).toBeNull();
  });
});

describe("카테고리 상세", () => {
  it("키워드마다 순위, 기사 수, 가장 최근 대표 기사 1건을 보여준다", async () => {
    stubGoogleNews({ 경제: rss(economy) });

    const detail = await getCategoryDetail("economy", { now: NOW });

    expect(detail).toMatchObject({ name: "경제", articleCount: 5 });
    expect(detail?.keywords.map((k) => [k.keyword, k.count, k.rank])).toEqual([
      ["코스피", 2, 1],
      ["기준금리", 2, 2],
      ["동결", 2, 3],
    ]);
    expect(detail?.keywords[0].latest).toMatchObject({
      title: "코스피 장중 상승 전환",
      link: "https://news.google.com/rss/articles/e1?oc=5",
    });
    expect(detail?.keywords[1].latest.title).toBe("기준금리 동결 결정");
  });

  it("없는 카테고리면 찾지 못했다고 알린다", async () => {
    stubGoogleNews({});

    expect(await getCategoryDetail("nowhere", { now: NOW })).toBeNull();
  });
});

