import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/keyword-map/back-link";
import { keywordHref } from "@/components/keyword-map/keyword-link";
import { NewsItem } from "@/components/keyword-map/news-item";
import { TrendChart } from "@/components/keyword-map/trend-chart";
import { VoteButtons } from "@/components/keyword-map/vote-buttons";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCount, formatDateTime, formatDay, formatShortDate } from "@/lib/format";
import { decodeParam } from "@/lib/params";
import { cn } from "@/lib/utils";
import { getKeywordDetail } from "@/modules/keyword-map";
import { getKeywordMeaning } from "@/modules/keyword-meaning";

const PREVIEW_COUNT = 10;
const SUMMARY_COUNT = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export default async function KeywordPage({ params }: { params: Promise<{ category: string; keyword: string }> }) {
  const { category, keyword: rawKeyword } = await params;
  const keyword = decodeParam(rawKeyword);
  const now = new Date();
  const detail = await getKeywordDetail(category, keyword, { now });
  if (!detail) notFound();

  const meaning = await getKeywordMeaning(keyword);
  const total = detail.articles.length;
  const representative = detail.articles.slice(0, SUMMARY_COUNT);

  const days = detail.dailyCounts.map((_, i) => new Date(now.getTime() - (detail.dailyCounts.length - 1 - i) * DAY_MS).toISOString());
  const maxCo = detail.coKeywords[0]?.count ?? 1;

  return (
    <main className="flex flex-col gap-4 pb-6">
      <BackLink fallbackHref={`/category/${detail.categoryId}`}>돌아가기</BackLink>

      <header className="flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Link href={`/category/${detail.categoryId}`} title="카테고리 자세히 보기">
            <Badge className="hover:bg-primary/80">{detail.categoryName} ›</Badge>
          </Link>
          <span>
            {detail.categoryName} {detail.rank}위 · 최근 2주 기사 {formatCount(total)}건
          </span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight">{keyword}</h1>
      </header>

      {meaning && (
        <Card>
          <CardHeader>
            <CardTitle>이 키워드의 뜻</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            <p className="leading-relaxed">{meaning.text}</p>
            <a href={meaning.sourceUrl} target="_blank" rel="noopener noreferrer" className="w-fit text-sm text-muted-foreground underline underline-offset-4">
              출처: {meaning.sourceName}
            </a>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>중요하게 다뤄지는 사항</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-muted-foreground">
            ‘{keyword}’이(가) 나온 가장 최근 대표 기사 {representative.length}건을 한 줄씩 보여드려요. 제목을 누르면 기사로 이동해요.
          </p>
          <ol className="flex flex-col gap-2.5">
            {representative.map((article) => (
              <li key={article.link} className="flex flex-col gap-0.5">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-relaxed underline-offset-4 hover:underline"
                >
                  {article.title}
                </a>
                <span className="text-xs text-muted-foreground">
                  {article.source} · {formatDateTime(article.publishedAt)}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            일별 기사 수 <span className="ml-1 text-xs font-normal text-muted-foreground">최근 2주, 헤드라인에 이 키워드가 나온 기사</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrendChart
            title={`‘${keyword}’ 일별 기사 수`}
            axisLabels={days.map(formatShortDate)}
            fullLabels={days.map(formatDay)}
            values={detail.dailyCounts}
          />
        </CardContent>
      </Card>

      {detail.coKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              함께 많이 언급된 키워드 <span className="ml-1 text-xs font-normal text-muted-foreground">같은 기사 헤드라인에 같이 나온 횟수</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-0.5">
              {detail.coKeywords.map((co) => (
                <li key={co.keyword}>
                  <Link
                    href={keywordHref(detail.categoryId, co.keyword)}
                    title={`${keyword}와(과) ${co.keyword}이(가) 함께 나온 기사 ${co.count}건`}
                    className="-mx-2 grid grid-cols-[6.5rem_1fr] items-center gap-2.5 rounded-lg px-2 py-1.5 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="text-[0.9375rem] font-medium break-words">{co.keyword}</span>
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="block h-4 min-w-1 rounded-r-sm bg-foreground/60" style={{ width: `${(co.count / maxCo) * 78}%` }} aria-hidden />
                      <b className="text-sm tabular-nums">{co.count}건</b>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            관련 뉴스 <span className="ml-1 text-xs font-normal text-muted-foreground">최신순 · 최근 2주 {formatCount(total)}건</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <ul className="flex flex-col divide-y">
            {detail.articles.slice(0, PREVIEW_COUNT).map((article) => (
              <NewsItem key={article.link} article={article} tags={article.keywords} />
            ))}
          </ul>
          {total > PREVIEW_COUNT && (
            <Link
              href={`${keywordHref(detail.categoryId, keyword)}/news`}
              className={cn(buttonVariants({ variant: "outline" }), "h-9 w-full")}
            >
              더보기 · ‘{keyword}’ 관련 뉴스 {formatCount(total)}건 전체 보기
            </Link>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <VoteButtons voteKey={`${detail.categoryId}:${keyword}`} />
        </CardContent>
      </Card>
    </main>
  );
}
