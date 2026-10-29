import { RiExternalLinkLine } from "@remixicon/react";

import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import type { Article } from "@/modules/keyword-map";

/** 기사 한 건. 제목과 "원문 보기"는 실제 기사로 이어지는 링크이고 새 창에서 열린다. */
export function NewsItem({ article, tags }: { article: Article; tags: string[] }) {
  return (
    <li className="flex flex-col gap-1.5 py-3">
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-base leading-snug font-semibold tracking-tight underline-offset-4 hover:underline"
      >
        {article.title}
      </a>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
        <Badge variant="secondary">{article.source}</Badge>
        <time dateTime={article.publishedAt}>{formatDateTime(article.publishedAt)}</time>
        {tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-medium text-foreground underline-offset-4 hover:underline"
        >
          원문 보기
          <RiExternalLinkLine className="size-3.5" aria-hidden />
        </a>
      </div>
    </li>
  );
}
