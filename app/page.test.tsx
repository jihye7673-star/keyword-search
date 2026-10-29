import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ErrorPage from "@/app/error";
import HomePage from "@/app/page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), back: vi.fn() }) }));

function rss(titles: string[]) {
  const now = new Date();
  const items = titles
    .map(
      (t, i) =>
        // 키워드가 되려면 서로 다른 언론사의 헤드라인에 나와야 하므로 기사마다 언론사를 달리한다.
        `<item><title>${t} - 언론사${i}</title><link>https://news.google.com/rss/articles/a${i}?oc=5</link>` +
        `<pubDate>${new Date(now.getTime() - i * 3600_000).toUTCString()}</pubDate>` +
        `<source url="https://press${i}.example">언론사${i}</source></item>`,
    )
    .join("");
  return `<rss version="2.0"><channel>${items}</channel></rss>`;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("키워드 맵 홈", () => {
  it("카테고리 8개와 키워드를 보여주고, 키워드를 누르면 키워드 상세로 가는 링크가 된다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const q = new URL(String(input)).searchParams.get("q") ?? "";
        const titles = q.startsWith("경제") ? ["코스피 반등 시작", "코스피 사흘째 상승"] : [];
        return new Response(rss(titles), { status: 200 });
      }),
    );

    render(await HomePage());

    expect(screen.getByRole("heading", { level: 1, name: "오늘의 뉴스 키워드" })).toBeInTheDocument();
    for (const name of ["정치", "경제", "사회", "세계", "문화", "IT/과학", "스포츠", "날씨"]) {
      expect(screen.getByRole("link", { name: `${name} 카테고리 자세히 보기` })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "경제 카테고리 자세히 보기" })).toHaveAttribute("href", "/category/economy");
    expect(screen.getByRole("link", { name: "코스피" })).toHaveAttribute("href", `/keyword/economy/${encodeURIComponent("코스피")}`);
    expect(screen.getByText("12시간마다 갱신")).toBeInTheDocument();
  });

  it("뉴스 아님 표시가 붙은 신조어 코너를 키워드 맵 밖에 따로 보여준다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(rss([]), { status: 200 })));

    render(await HomePage());

    const corner = screen.getByRole("region", { name: "오늘의 신조어" });
    expect(within(corner).getByText("뉴스 아님")).toBeInTheDocument();
    expect(within(corner).getAllByRole("heading", { level: 3 })).toHaveLength(5);
    // 신조어는 카테고리가 아니라서 카테고리 링크에 없다
    expect(screen.queryByRole("link", { name: "신조어 카테고리 자세히 보기" })).not.toBeInTheDocument();
  });

  it("신조어에서 다른 신조어 보기를 누르면 다음 5개로 바뀐다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(rss([]), { status: 200 })));
    render(await HomePage());
    const corner = screen.getByRole("region", { name: "오늘의 신조어" });
    const before = within(corner).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);

    fireEvent.click(within(corner).getByRole("button", { name: "다른 신조어 보기" }));

    const after = within(corner).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(after).toHaveLength(5);
    expect(after).not.toEqual(before);
  });

  it("일부 카테고리만 불러오지 못하면 알림과 다시 시도 버튼을 보여주고 나머지는 그대로 보여준다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const q = new URL(String(input)).searchParams.get("q") ?? "";
        if (q.startsWith("경제")) return new Response("busy", { status: 503 });
        return new Response(rss(["오세훈 재판 시작", "오세훈 무죄 주장"]), { status: 200 });
      }),
    );

    render(await HomePage());

    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("새 뉴스를 불러오지 못했어요")).toBeInTheDocument();
    expect(within(alert).getByText(/경제 카테고리의 뉴스를 불러오지 못했어요/)).toBeInTheDocument();
    expect(within(alert).getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "오세훈" }).length).toBeGreaterThan(0);
  });

  it("모든 카테고리를 불러오지 못하면 화면을 만들지 않고 오류로 넘긴다", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("busy", { status: 503 })));

    await expect(HomePage()).rejects.toThrow();
  });
});

describe("오류 화면", () => {
  it("뉴스를 불러오지 못했다는 알림과 다시 시도 버튼을 보여주고, 누르면 다시 시도한다", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("x")} reset={reset} />);

    expect(screen.getByText("새 뉴스를 불러오지 못했어요")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
