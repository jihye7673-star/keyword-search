import Link from "next/link";

import { cn } from "@/lib/utils";

export function keywordHref(categoryId: string, keyword: string) {
  return `/keyword/${categoryId}/${encodeURIComponent(keyword)}`;
}

/** 순위를 글자 크기 5단계로 바꾼다. 1위가 가장 크고, 인접 순위가 같은 크기를 나눠 쓴다. */
export function sizeLevel(rank: number): 1 | 2 | 3 | 4 | 5 {
  if (rank <= 1) return 1;
  if (rank <= 3) return 2;
  if (rank <= 5) return 3;
  return rank === 6 ? 4 : 5;
}

/** 상자나 알약 없이 글자 크기, 굵기, 색으로만 위계를 준다. 1위만 포인트 색을 쓴다. */
const COMPACT = {
  1: "text-[2.125rem] font-bold text-primary",
  2: "text-2xl font-semibold",
  3: "text-lg font-medium",
  4: "text-[0.9375rem] text-muted-foreground",
  5: "text-[0.8125rem] text-muted-foreground",
} as const;

const LARGE = {
  1: "text-5xl font-bold text-primary",
  2: "text-3xl font-semibold",
  3: "text-xl font-medium",
  4: "text-base text-muted-foreground",
  5: "text-sm text-muted-foreground",
} as const;

export function KeywordLink({
  categoryId,
  keyword,
  rank,
  count,
  large = false,
}: {
  categoryId: string;
  keyword: string;
  rank: number;
  count: number;
  large?: boolean;
}) {
  const level = sizeLevel(rank);
  return (
    <Link
      href={keywordHref(categoryId, keyword)}
      title={`기사 ${count}건`}
      className={cn(
        "rounded px-0.5 leading-snug tracking-tight whitespace-nowrap underline-offset-4 decoration-primary decoration-[1.5px] outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50",
        (large ? LARGE : COMPACT)[level],
      )}
    >
      {keyword}
    </Link>
  );
}
