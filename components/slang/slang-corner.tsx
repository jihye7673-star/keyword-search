"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSlangPage, slangPageCount } from "@/modules/slang";

/** 뉴스가 아닌 재미 코너. 점선 테두리와 "뉴스 아님" 표시로 뉴스 영역과 구분한다. */
export function SlangCorner() {
  const [page, setPage] = useState(0);
  const words = getSlangPage(page);

  return (
    <section aria-labelledby="slang-title" className="flex flex-col gap-3.5 rounded-xl border border-dashed border-ring bg-card p-4 text-card-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="slang-title" className="text-lg font-semibold tracking-tight">
            오늘의 신조어
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            잠깐 쉬어가는 재미 코너예요. 뉴스가 아니라 요즘 인터넷에서 쓰이는 말을 모았고, 욕설과 나쁜 말은 빼고 보여드려요.
          </p>
        </div>
        <Badge variant="secondary">뉴스 아님</Badge>
      </div>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(168px,1fr))] gap-2.5">
        {words.map((w) => (
          <li key={w.word} className="flex flex-col gap-1.5 rounded-xl bg-muted p-3.5">
            <h3 className="text-xl font-semibold tracking-tight">{w.word}</h3>
            <p className="text-sm leading-relaxed">{w.meaning}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">예) {w.example}</p>
            <Badge variant="outline" className="mt-0.5 h-auto max-w-full self-start py-0.5 whitespace-normal">
              쓰이는 곳 · {w.usedAt}
            </Badge>
          </li>
        ))}
      </ul>

      <Button variant="outline" className="self-start" onClick={() => setPage((p) => (p + 1) % slangPageCount())}>
        다른 신조어 보기
      </Button>
    </section>
  );
}
