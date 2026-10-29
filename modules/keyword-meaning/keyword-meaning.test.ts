import { afterEach, describe, expect, it, vi } from "vitest";

import { getKeywordMeaning } from "@/modules/keyword-meaning";

function stubWikipedia(status: number, body: unknown) {
  const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("키워드의 뜻", () => {
  it("한국어 위키백과 문서의 첫 두 문장을 출처 링크와 함께 보여준다", async () => {
    const fetchMock = stubWikipedia(200, {
      type: "standard",
      extract:
        "기준금리는 중앙은행이 정하는 기본 정책금리이다. 시중 금리의 기준이 된다. 세 번째 문장은 보여주지 않는다.",
      content_urls: { desktop: { page: "https://ko.wikipedia.org/wiki/기준금리" } },
    });

    const meaning = await getKeywordMeaning("기준금리");

    expect(meaning).toEqual({
      text: "기준금리는 중앙은행이 정하는 기본 정책금리이다. 시중 금리의 기준이 된다.",
      sourceName: "위키백과",
      sourceUrl: "https://ko.wikipedia.org/wiki/기준금리",
    });
    expect(String(fetchMock.mock.calls[0][0])).toContain(encodeURIComponent("기준금리"));
  });

  it("같은 이름의 문서가 없으면 뜻을 보여주지 않는다", async () => {
    stubWikipedia(404, { type: "https://mediawiki.org/wiki/HyperSwitch/errors/not_found" });

    expect(await getKeywordMeaning("없는말")).toBeNull();
  });

  it("여러 뜻을 가르는 안내 문서는 뜻으로 쓰지 않는다", async () => {
    stubWikipedia(200, {
      type: "disambiguation",
      extract: "배는 다음을 가리킨다.",
      content_urls: { desktop: { page: "https://ko.wikipedia.org/wiki/배" } },
    });

    expect(await getKeywordMeaning("배")).toBeNull();
  });

  it("위키백과에 연결하지 못해도 오류 대신 뜻 없음으로 처리한다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("network"); }));

    expect(await getKeywordMeaning("코스피")).toBeNull();
  });
});
