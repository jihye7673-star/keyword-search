import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** 뉴스를 불러오는 동안 보이는 자리 표시자 */
export default function Loading() {
  return (
    <main className="flex flex-col gap-5" aria-busy="true" aria-label="뉴스를 불러오는 중">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-64" />
      </div>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Card key={i} className="gap-3 px-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-5 w-2/5" />
          </Card>
        ))}
      </div>
    </main>
  );
}
