import { describe, expect, it } from "vitest";

import { SLANG_PAGE_SIZE, getSlangPage, slangPageCount } from "@/modules/slang";

describe("오늘의 신조어", () => {
  it("한 번에 5개를 단어, 뜻, 예문, 쓰이는 곳과 함께 보여준다", () => {
    const page = getSlangPage(0);

    expect(SLANG_PAGE_SIZE).toBe(5);
    expect(page).toHaveLength(5);
    for (const word of page) {
      expect(word.word.length).toBeGreaterThan(0);
      expect(word.meaning.length).toBeGreaterThan(0);
      expect(word.example.length).toBeGreaterThan(0);
      expect(word.usedAt.length).toBeGreaterThan(0);
    }
  });

  it("끝까지 가면 처음 쪽으로 돌아온다", () => {
    const pages = slangPageCount();

    expect(getSlangPage(pages)).toEqual(getSlangPage(0));
    expect(getSlangPage(-1)).toEqual(getSlangPage(pages - 1));
  });

  it("욕설과 나쁜 말은 단어, 뜻, 예문 어디에도 없다", () => {
    const banned = ["씨발", "시발", "병신", "지랄", "새끼", "미친", "꺼져", "죽어", "ㅅㅂ", "ㅂㅅ", "한남", "김치녀", "맘충", "좆", "닥쳐", "엿먹"];
    const text = Array.from({ length: slangPageCount() }, (_, i) => getSlangPage(i))
      .flat()
      .map((w) => `${w.word} ${w.meaning} ${w.example}`)
      .join(" ");

    expect(banned.filter((b) => text.includes(b))).toEqual([]);
  });
});
