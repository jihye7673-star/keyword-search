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

const COMPACT = {
  1: "bg-primary px-4 py-1 text-3xl font-bold text-primary-foreground hover:bg-primary/90",
  2: "px-2 text-2xl font-semibold hover:bg-muted",
  3: "px-2 text-lg font-medium hover:bg-muted",
  4: "px-2 text-base text-muted-foreground hover:bg-muted",
  5: "px-2 text-sm text-muted-foreground hover:bg-muted",
} as const;

const LARGE = {
  1: "bg-primary px-5 py-1.5 text-4xl font-bold text-primary-foreground hover:bg-primary/90",
  2: "px-3 text-3xl font-semibold hover:bg-muted",
  3: "px-3 text-xl font-medium hover:bg-muted",
  4: "px-2 text-base text-muted-foreground hover:bg-muted",
  5: "px-2 text-sm text-muted-foreground hover:bg-muted",
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
        "rounded-full leading-snug tracking-tight whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        (large ? LARGE : COMPACT)[level],
      )}
    >
      {keyword}
    </Link>
  );
}
