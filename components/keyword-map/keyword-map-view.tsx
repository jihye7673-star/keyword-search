"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { formatCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategorySnapshot } from "@/modules/keyword-map";

import { KeywordLink } from "./keyword-link";

/** 넓은 화면에서 허브(가운데) 둘레에 카테고리를 놓는 3×3 배치 */
const WIDE_PLACEMENT: Record<string, string> = {
  politics: "@min-[640px]:col-start-1 @min-[640px]:row-start-1",
  economy: "@min-[640px]:col-start-2 @min-[640px]:row-start-1",
  society: "@min-[640px]:col-start-3 @min-[640px]:row-start-1",
  culture: "@min-[640px]:col-start-1 @min-[640px]:row-start-2 @min-[640px]:self-center",
  "it-science": "@min-[640px]:col-start-3 @min-[640px]:row-start-2 @min-[640px]:self-center",
  sports: "@min-[640px]:col-start-1 @min-[640px]:row-start-3",
  weather: "@min-[640px]:col-start-2 @min-[640px]:row-start-3",
  world: "@min-[640px]:col-start-3 @min-[640px]:row-start-3",
};

type Line = { x1: number; y1: number; x2: number; y2: number };

/**
 * 키워드 맵. 카테고리마다 상자 없이 위쪽 가는 선과 여백으로 묶고,
 * 넓은 화면에서는 가운데 허브에서 각 카테고리로 가는 선을 이어 마인드맵 형태를 유지한다.
 */
export function KeywordMapView({ categories }: { categories: CategorySnapshot[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
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
        [...sectionRefs.current.values()].map((el) => {
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
      <div ref={mapRef} className="relative grid grid-cols-1 @min-[640px]:grid-cols-3 @min-[640px]:gap-x-10 @min-[640px]:gap-y-2">
        <svg className="pointer-events-none absolute inset-0 hidden size-full @min-[640px]:block" aria-hidden>
          {lines.map((l, i) => (
            <line key={i} {...l} className="stroke-border" strokeWidth={1} />
          ))}
        </svg>

        <div
          ref={hubRef}
          className="relative z-10 hidden size-34 flex-col items-center justify-center gap-0.5 place-self-center rounded-full border-[1.5px] border-primary bg-background text-center text-primary @min-[640px]:col-start-2 @min-[640px]:row-start-2 @min-[640px]:flex"
        >
          <b className="text-[0.9375rem] tracking-tight">오늘의 키워드</b>
          <span className="text-xs text-muted-foreground">{categories.length}개 카테고리</span>
        </div>

        {categories.map((category) => (
          <section
            key={category.id}
            ref={(el) => {
              if (el) sectionRefs.current.set(category.id, el);
              else sectionRefs.current.delete(category.id);
            }}
            className={cn("relative z-10 flex flex-col gap-2 border-t bg-background py-5 @min-[640px]:py-6", WIDE_PLACEMENT[category.id])}
          >
            <header className="flex items-baseline justify-between gap-2">
              <h2 className="text-[0.9375rem] font-bold">
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
              </h2>
              <span className="text-xs text-muted-foreground">기사 {formatCount(category.articleCount)}건</span>
            </header>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              {category.keywords.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">
                  {category.failed ? "이 카테고리의 뉴스를 불러오지 못했어요." : "아직 키워드를 뽑을 만큼 기사가 모이지 않았어요."}
                </p>
              ) : (
                category.keywords.map((k) => (
                  <KeywordLink key={k.keyword} categoryId={category.id} keyword={k.keyword} rank={k.rank} count={k.count} />
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
