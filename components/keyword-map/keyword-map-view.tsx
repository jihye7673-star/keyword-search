"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategorySnapshot } from "@/modules/keyword-map";

import { KeywordLink } from "./keyword-link";

/** 넓은 화면에서 허브(가운데) 둘레에 카테고리를 놓는 3×3 배치 */
const WIDE_PLACEMENT: Record<string, string> = {
  politics: "@min-[640px]:col-start-1 @min-[640px]:row-start-1",
  economy: "@min-[640px]:col-start-2 @min-[640px]:row-start-1",
  society: "@min-[640px]:col-start-3 @min-[640px]:row-start-1",
  culture: "@min-[640px]:col-start-1 @min-[640px]:row-start-2",
  "it-science": "@min-[640px]:col-start-3 @min-[640px]:row-start-2",
  sports: "@min-[640px]:col-start-1 @min-[640px]:row-start-3",
  weather: "@min-[640px]:col-start-2 @min-[640px]:row-start-3",
  world: "@min-[640px]:col-start-3 @min-[640px]:row-start-3",
};

type Line = { x1: number; y1: number; x2: number; y2: number };

export function KeywordMapView({ categories }: { categories: CategorySnapshot[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const measure = () => {
      const hub = hubRef.current;
      const box = map.getBoundingClientRect();
      // 좁은 화면에서는 허브가 보이지 않아 선도 그리지 않는다.
      if (!hub || hub.offsetParent === null || box.width < 640) {
        setLines([]);
        return;
      }
      const h = hub.getBoundingClientRect();
      const hx = h.left - box.left + h.width / 2;
      const hy = h.top - box.top + h.height / 2;
      setLines(
        [...cardRefs.current.values()].map((el) => {
          const r = el.getBoundingClientRect();
          return { x1: hx, y1: hy, x2: r.left - box.left + r.width / 2, y2: r.top - box.top + r.height / 2 };
        }),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(map);
    return () => observer.disconnect();
  }, [categories.length]);

  return (
    <div className="@container">
      <div ref={mapRef} className="relative grid grid-cols-1 gap-3.5 @min-[640px]:grid-cols-3 @min-[640px]:gap-x-6 @min-[640px]:gap-y-7">
        <svg className="pointer-events-none absolute inset-0 hidden size-full @min-[640px]:block" aria-hidden>
          {lines.map((l, i) => (
            <line key={i} {...l} className="stroke-ring" strokeWidth={1.5} strokeDasharray="2 5" strokeLinecap="round" />
          ))}
        </svg>

        <div
          ref={hubRef}
          className="relative z-10 hidden size-36 flex-col items-center justify-center gap-0.5 place-self-center rounded-full bg-primary text-center text-primary-foreground @min-[640px]:col-start-2 @min-[640px]:row-start-2 @min-[640px]:flex"
        >
          <b className="text-base tracking-tight">오늘의 키워드</b>
          <span className="text-xs opacity-75">{categories.length}개 카테고리</span>
        </div>

        <aside className="relative z-10 order-first flex flex-col justify-center gap-2 rounded-xl border border-dashed bg-background p-3 text-sm leading-relaxed text-muted-foreground @min-[640px]:order-none @min-[640px]:col-span-3 @min-[640px]:row-start-4 @min-[640px]:flex-row @min-[640px]:flex-wrap @min-[640px]:items-center @min-[640px]:gap-x-6">
          <p>글자가 클수록 최근 2주간 여러 뉴스 헤드라인에서 더 많이 다뤄진 키워드예요.</p>
          <p className="flex items-baseline gap-2.5 text-foreground" aria-hidden>
            <span className="text-2xl font-bold tracking-tight">많이</span>
            <span className="text-lg">보통</span>
            <span className="text-sm text-muted-foreground">적게</span>
          </p>
          <p>키워드를 누르면 뜻과 관련 뉴스를 볼 수 있어요.</p>
        </aside>

        {categories.map((category) => (
          <Card
            key={category.id}
            ref={(el: HTMLDivElement | null) => {
              if (el) cardRefs.current.set(category.id, el);
              else cardRefs.current.delete(category.id);
            }}
            className={cn("relative z-10 gap-2.5", WIDE_PLACEMENT[category.id])}
          >
            <CardHeader className="flex items-baseline justify-between gap-2">
              <CardTitle className="text-sm font-bold">
                <Link
                  href={`/category/${category.id}`}
                  aria-label={`${category.name} 카테고리 자세히 보기`}
                  className="-mx-1.5 rounded-lg px-1.5 py-0.5 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {category.name}
                  <span aria-hidden className="ml-0.5 font-normal text-muted-foreground">
                    ›
                  </span>
                </Link>
              </CardTitle>
              <span className="text-xs text-muted-foreground">기사 {formatCount(category.articleCount)}건</span>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 py-1">
              {category.keywords.length === 0 ? (
                <p className="py-6 text-sm text-muted-foreground">
                  {category.failed ? "이 카테고리의 뉴스를 불러오지 못했어요." : "아직 키워드를 뽑을 만큼 기사가 모이지 않았어요."}
                </p>
              ) : (
                category.keywords.map((k) => (
                  <KeywordLink key={k.keyword} categoryId={category.id} keyword={k.keyword} rank={k.rank} count={k.count} />
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
