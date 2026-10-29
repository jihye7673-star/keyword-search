"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/** 새 뉴스를 불러오지 못했을 때의 오류 알림. 다시 시도하면 화면을 새로 받아 온다. */
export function RefreshAlert({ message }: { message: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-col gap-0.5">
        <AlertTitle>새 뉴스를 불러오지 못했어요</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </div>
      <Button variant="outline" disabled={pending} onClick={() => start(() => router.refresh())}>
        {pending ? "불러오는 중" : "다시 시도"}
      </Button>
    </Alert>
  );
}
