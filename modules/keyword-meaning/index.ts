export type KeywordMeaning = {
  text: string;
  sourceName: string;
  sourceUrl: string;
};

/** 뜻 설명은 일주일에 한 번만 다시 가져온다. */
const REVALIDATE_SECONDS = 60 * 60 * 24 * 7;
const MAX_SENTENCES = 2;

type WikipediaSummary = {
  type?: string;
  extract?: string;
  content_urls?: { desktop?: { page?: string } };
};

function firstSentences(extract: string) {
  const sentences = extract.match(/[^.!?。]+[.!?。]?/g) ?? [];
  return sentences.slice(0, MAX_SENTENCES).join("").trim();
}

/** 한국어 위키백과에 같은 이름의 문서가 있으면 첫 부분을 뜻으로 돌려주고, 없으면 null 이다. */
export async function getKeywordMeaning(keyword: string): Promise<KeywordMeaning | null> {
  try {
    const res = await fetch(
      `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(keyword)}`,
      {
        headers: { "User-Agent": "keyword-news-map/0.1", Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
    if (!res.ok) return null;
    const page = (await res.json()) as WikipediaSummary;
    const sourceUrl = page.content_urls?.desktop?.page;
    if (page.type !== "standard" || !page.extract || !sourceUrl) return null;
    return { text: firstSentences(page.extract), sourceName: "위키백과", sourceUrl };
  } catch {
    return null;
  }
}
