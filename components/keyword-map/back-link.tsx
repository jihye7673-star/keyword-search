"use client";

import { RiArrowLeftLine } from "@remixicon/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

/** 사용자가 온 곳으로 돌아간다. 바로 열었다면 fallbackHref 로 간다. */
export function BackLink({ fallbackHref, children }: { fallbackHref: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      className="self-start"
      onClick={() => (window.history.length > 1 ? router.back() : router.push(fallbackHref))}
    >
      <RiArrowLeftLine data-icon="inline-start" />
      {children}
    </Button>
  );
}
