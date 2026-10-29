import { RiExternalLinkLine } from "@remixicon/react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackTo } from "@/components/keyword-map/back-to";
import { KeywordLink, keywordHref } from "@/components/keyword-map/keyword-link";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCount, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CATEGORIES, getCategoryDetail } from "@/modules/keyword-map";
import { getKeywordMeaning } from "@/modules/keyword-meaning";

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getCategoryDetail(id);
  if (!detail) notFound();

  const meanings = await Promise.all(detail.keywords.map((k) => getKeywordMeaning(k.keyword)));
  const top = detail.keywords[0];
  const maxCount = top?.count ?? 1;

  return (
    <main className="flex flex-col gap-5 pb-6">
      <BackTo href="/">키워드 맵으로</BackTo>

      <nav aria-label="카테고리 바로가기" className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.id}`}
            aria-current={c.id === detail.id ? "page" : undefined}
            className={buttonVariants({ variant: c.id === detail.id ? "default" : "outline", size: "sm" })}
          >
            {c.name}
          </Link>
        ))}
      </nav>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <Badge>{detail.name}</Badge>
          <span>
            기사 {formatCount(detail.articleCount)}건 · {formatDateTime(detail.updatedAt)} 기준
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{detail.name}</h1>
        <p className="leading-relaxed text-muted-foreground">
          {top
            ? `최근 2주간 ${detail.name} 뉴스 ${formatCount(detail.articleCount)}건의 헤드라인에서 키워드 ${detail.keywords.length}개가 여러 기사에 걸쳐 반복해 나타났어요. 가장 많이 다뤄진 키워드는 ‘${top.keyword}’입니다.`
            : `최근 2주간 ${detail.name} 뉴스 ${formatCount(detail.articleCount)}건이 모였지만, 여러 헤드라인에 반복해 나온 키워드는 아직 없어요.`}
        </p>
      </header>

      {top && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>이 카테고리에서 많이 다뤄진 키워드</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 py-2">
              {detail.keywords.map((k) => (
                <KeywordLink key={k.keyword} large categoryId={detail.id} keyword={k.keyword} rank={k.rank} count={k.count} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>키워드 순위</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="flex flex-col">
                {detail.keywords.map((k, i) => {
                  const meaning = meanings[i];
                  return (
                    <li key={k.keyword} className="grid grid-cols-[1.75rem_1fr] gap-x-2.5 gap-y-1 border-t py-4 first:border-t-0 first:pt-1">
                      <span className="text-lg font-bold leading-snug text-muted-foreground">{k.rank}</span>
                      <div className="flex min-w-0 flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <Link href={keywordHref(detail.id, k.keyword)} className="text-lg font-bold tracking-tight underline-offset-4 hover:underline">
                            {k.keyword}
                          </Link>
                          <span className="text-sm text-muted-foreground">기사 {formatCount(k.count)}건</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
                          <div className="h-full rounded-full bg-foreground/60" style={{ width: `${(k.count / maxCount) * 100}%` }} />
                        </div>
                        {meaning && (
                          <p className="text-sm leading-relaxed">
                            {meaning.text}{" "}
                            <a href={meaning.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline underline-offset-4">
                              {meaning.sourceName}
                            </a>
                          </p>
                        )}
                        <div className="flex flex-col gap-1 rounded-lg bg-muted px-3 py-2.5">
                          <a
                            href={k.latest.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[0.9375rem] leading-snug font-semibold underline-offset-4 hover:underline"
                          >
                            {k.latest.title}
                          </a>
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
                            <Badge variant="secondary">{k.latest.source}</Badge>
                            <time dateTime={k.latest.publishedAt}>{formatDateTime(k.latest.publishedAt)}</time>
                            <a
                              href={k.latest.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 font-medium text-foreground underline-offset-4 hover:underline"
                            >
                              원문 보기
                              <RiExternalLinkLine className="size-3.5" aria-hidden />
                            </a>
                          </div>
                        </div>
                        <Link href={keywordHref(detail.id, k.keyword)} className={cn(buttonVariants({ variant: "outline" }), "self-start")}>
                          이 키워드 자세히 보기
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </>
      )}

      <p className="text-xs text-muted-foreground">뉴스 제공: 구글 뉴스 · 최근 2주 뉴스 기준</p>
    </main>
  );
}
