import { RiArrowLeftLine } from "@remixicon/react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 이름 그대로 정해진 화면으로 돌아가는 링크. 브라우저 기록과 상관없이 같은 곳으로 간다. */
export function BackTo({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant: "ghost" }), "self-start")}>
      <RiArrowLeftLine data-icon="inline-start" />
      {children}
    </Link>
  );
}
