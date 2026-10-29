import { describe, expect, it } from "vitest";

import { formatCount, formatDateTime, formatDay, formatShortDate } from "@/lib/format";

describe("한국 시각 표기", () => {
  it("UTC 시각을 한국 시각으로 바꿔 월·일·시각으로 보여준다", () => {
    expect(formatDateTime("2026-10-29T02:00:00Z")).toBe("10월 29일 11:00");
  });

  it("날짜를 요일과 함께 보여준다", () => {
    expect(formatDay("2026-10-29T02:00:00Z")).toBe("10월 29일 (목)");
  });

  it("한국 시각으로 자정을 넘기면 다음 날로 센다", () => {
    expect(formatShortDate("2026-10-28T16:00:00Z")).toBe("10/29");
    expect(formatShortDate("2026-10-28T14:59:00Z")).toBe("10/28");
  });

  it("천 단위로 쉼표를 넣는다", () => {
    expect(formatCount(2417)).toBe("2,417");
  });
});
