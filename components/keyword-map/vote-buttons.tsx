"use client";

import { RiThumbDownLine, RiThumbUpLine } from "@remixicon/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type Vote = "like" | "dislike" | null;

function storageKey(voteKey: string) {
  return `keyword-vote:${voteKey}`;
}

/** 좋아요/싫어요 중 하나만 고르고, 같은 걸 다시 누르면 해제한다. 선택은 이 브라우저에만 저장한다. */
export function VoteButtons({ voteKey }: { voteKey: string }) {
  const [vote, setVote] = useState<Vote>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(voteKey));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 저장된 선택은 브라우저에서만 읽을 수 있다
      setVote(saved === "like" || saved === "dislike" ? saved : null);
    } catch {
      setVote(null);
    }
  }, [voteKey]);

  function choose(next: Exclude<Vote, null>) {
    const value = vote === next ? null : next;
    setVote(value);
    try {
      if (value) window.localStorage.setItem(storageKey(voteKey), value);
      else window.localStorage.removeItem(storageKey(voteKey));
    } catch {
      // 저장이 막힌 브라우저에서는 이번 화면에서만 유지한다.
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="flex-1 basis-48 text-sm font-medium">이 키워드 정보가 도움이 되었나요?</p>
        <div className="flex gap-2">
          <Button variant={vote === "like" ? "default" : "outline"} aria-pressed={vote === "like"} onClick={() => choose("like")}>
            <RiThumbUpLine data-icon="inline-start" />
            좋아요
          </Button>
          <Button variant={vote === "dislike" ? "default" : "outline"} aria-pressed={vote === "dislike"} onClick={() => choose("dislike")}>
            <RiThumbDownLine data-icon="inline-start" />
            싫어요
          </Button>
        </div>
      </div>
      {vote && <p className="text-sm text-muted-foreground">의견을 남겨 주셔서 고마워요. 더 나은 키워드를 고르는 데 쓰여요.</p>}
    </div>
  );
}
