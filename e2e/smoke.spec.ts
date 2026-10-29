import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 키워드 맵 제목과 신조어 코너가 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("오늘의 뉴스 키워드");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("오늘의 뉴스 키워드");
  await expect(page.getByRole("region", { name: "오늘의 신조어" })).toBeVisible();
});
