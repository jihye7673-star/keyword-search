import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-col items-start gap-4 py-10">
      <h1 className="text-xl font-semibold tracking-tight">찾을 수 없는 키워드예요</h1>
      <p className="text-sm text-muted-foreground">뉴스가 12시간마다 새로 모이면서 이 키워드가 사라졌을 수 있어요.</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        키워드 맵으로
      </Link>
    </main>
  );
}
