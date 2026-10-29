import { KeywordMapView } from "@/components/keyword-map/keyword-map-view";
import { RefreshAlert } from "@/components/keyword-map/refresh-alert";
import { SlangCorner } from "@/components/slang/slang-corner";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { getKeywordMap } from "@/modules/keyword-map";

export default async function HomePage() {
  const map = await getKeywordMap();
  const failed = map.categories.filter((c) => c.failed);

  return (
    <main className="flex flex-col gap-5 pb-6">
      <header className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-[clamp(1.75rem,4.2vw,2.5rem)] leading-tight font-bold tracking-tight">오늘의 뉴스 키워드</h1>
        <p className="max-w-[60ch] text-[0.9375rem] leading-relaxed text-muted-foreground">
          최근 2주 헤드라인에서 가장 많이 다뤄진 말을 카테고리별로 모았어요. 글자가 클수록 더 많이 다뤄졌고, 키워드를 누르면 뜻과 관련 뉴스를 볼 수 있어요.
        </p>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
          <Badge variant="secondary">12시간마다 갱신</Badge>
          <span>{formatDateTime(map.updatedAt)} 기준 · 최근 2주 뉴스</span>
        </div>
      </header>

      {failed.length > 0 && (
        <RefreshAlert
          message={
            failed.length === map.categories.length
              ? "구글 뉴스에 연결하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
              : `${failed.map((c) => c.name).join(", ")} 카테고리의 뉴스를 불러오지 못했어요. 나머지는 그대로 보여드려요.`
          }
        />
      )}

      <KeywordMapView categories={map.categories} />

      <p className="text-xs text-muted-foreground">뉴스 제공: 구글 뉴스 · 키워드는 뉴스 헤드라인에서 추출해요.</p>

      <SlangCorner />
    </main>
  );
}
