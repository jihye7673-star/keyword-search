"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/** 화면을 만들다 뉴스를 불러오지 못했을 때 */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-col gap-4">
      <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <AlertTitle>새 뉴스를 불러오지 못했어요</AlertTitle>
          <AlertDescription>잠시 뒤에 다시 시도해 주세요.</AlertDescription>
        </div>
        <Button variant="outline" onClick={reset}>
          다시 시도
        </Button>
      </Alert>
    </main>
  );
}
