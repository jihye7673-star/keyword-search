import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const robotoHeading = Roboto({ subsets: ["latin"], variable: "--font-heading" });

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "오늘의 뉴스 키워드",
  description: "뉴스를 챙겨볼 시간이 없는 사람을 위해, 카테고리별로 많이 논의되는 키워드와 관련 뉴스를 한눈에 보여줘요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", figtree.variable, robotoHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6">{children}</div>
      </body>
    </html>
  );
}
