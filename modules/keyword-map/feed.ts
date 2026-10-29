import type { Article } from "./types";

/** 구글 뉴스를 12시간마다 한 번만 다시 부른다. */
export const REVALIDATE_SECONDS = 60 * 60 * 12;

export function feedUrl(query: string) {
  const q = encodeURIComponent(`${query} when:14d`);
  return `https://news.google.com/rss/search?q=${q}&hl=ko&gl=KR&ceid=KR:ko`;
}

export type Feed = { articles: Article[]; /** 구글 뉴스에서 실제로 받아 온 시각. 알 수 없으면 null */ collectedAt: Date | null };

export async function fetchFeed(query: string): Promise<Feed> {
  const res = await fetch(feedUrl(query), {
    headers: { "User-Agent": "Mozilla/5.0 (keyword-news-map)" },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`구글 뉴스 응답 오류 ${res.status}`);
  // 캐시에서 꺼낸 응답에도 처음 받아 온 때의 Date 헤더가 남아 있다.
  const date = res.headers.get("date");
  const collectedAt = date && !Number.isNaN(new Date(date).getTime()) ? new Date(date) : null;
  return { articles: parseFeed(await res.text()), collectedAt };
}

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string) {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m);
}

function tag(block: string, name: string) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`));
  return m ? decodeEntities(m[1]).trim() : "";
}

export function parseFeed(xml: string): Article[] {
  const articles: Article[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const link = tag(block, "link");
    const source = tag(block, "source");
    const publishedAt = new Date(tag(block, "pubDate"));
    let title = tag(block, "title");
    if (source && title.endsWith(` - ${source}`)) {
      title = title.slice(0, -(source.length + 3));
    }
    if (!link || !title || Number.isNaN(publishedAt.getTime())) continue;
    articles.push({ link, title, source, publishedAt: publishedAt.toISOString() });
  }
  return articles;
}
