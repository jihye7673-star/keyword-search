import Link from "next/link";
import { notFound } from "next/navigation";

import { BackTo } from "@/components/keyword-map/back-to";
import { keywordHref } from "@/components/keyword-map/keyword-link";
import { NewsItem } from "@/components/keyword-map/news-item";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCount, formatDay } from "@/lib/format";
import { decodeParam } from "@/lib/params";
import { cn } from "@/lib/utils";
import { getKeywordDetail } from "@/modules/keyword-map";

const PAGE_SIZE = 20;

/** shown 쪽지: 지금까지 보여준 건수. 20건 단위로 늘어나며, 범위를 벗어나면 첫 20건으로 본다. */
function parseShown(raw: string | undefined, total: number) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < PAGE_SIZE) return Math.min(PAGE_SIZE, total);
  return Math.min(n, total);
}

export default async function KeywordNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; keyword: string }>;
  searchParams: Promise<{ shown?: string }>;
}) {
  const { category, keyword: rawKeyword } = await params;
  const { shown: rawShown } = await searchParams;
  const keyword = decodeParam(rawKeyword);
  const now = new Date();
  const detail = await getKeywordDetail(category, keyword, { now });
  if (!detail) notFound();

  const total = detail.articles.length;
  const shown = parseShown(rawShown, total);
  const left = total - shown;
  const todayDay = formatDay(now.toISOString());

  const rows: React.ReactNode[] = [];
  let lastDay = "";
  detail.articles.slice(0, shown).forEach((article, i) => {
    const day = formatDay(article.publishedAt);
    if (day !== lastDay) {
      lastDay = day;
      rows.push(
        <li key={`day-${day}`} className="pt-4 pb-1 text-sm font-bold text-muted-foreground first:pt-0">
          {day === todayDay ? `오늘 · ${day}` : day}
        </li>,
      );
    }
    rows.push(<NewsItem key={`${article.link}-${i}`} article={article} tags={article.keywords} />);
  });

  return (
    <main className="flex flex-col gap-4 pb-6">
      <BackTo href={keywordHref(detail.categoryId, keyword)}>‘{keyword}’ 키워드로</BackTo>

      <header className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Badge>{detail.categoryName}</Badge>
          <span>
            최근 2주 기사 {formatCount(total)}건 · 최신순 · {formatCount(shown)}건 표시 중
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">‘{keyword}’ 전체 뉴스</h1>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3">
          <ul className="flex flex-col">{rows}</ul>
          {left > 0 ? (
            <Link
              href={`${keywordHref(detail.categoryId, keyword)}/news?shown=${shown + PAGE_SIZE}`}
              scroll={false}
              className={cn(buttonVariants({ variant: "outline" }), "h-9 w-full")}
            >
              더 불러오기 · {Math.min(PAGE_SIZE, left)}건 (남은 기사 {formatCount(left)}건)
            </Link>
          ) : (
            <p className="py-2 text-center text-sm text-muted-foreground">최근 2주 기사를 모두 불러왔어요.</p>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">뉴스 제공: 구글 뉴스 · 최근 2주 뉴스 기준 · 제목을 누르면 원문으로 이동해요.</p>
    </main>
  );
}
