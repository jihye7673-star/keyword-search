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
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">오늘의 뉴스 키워드</h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
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
