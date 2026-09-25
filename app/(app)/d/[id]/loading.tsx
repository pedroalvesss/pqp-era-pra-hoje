import { Skeleton } from "@/components/Skeleton";

export default function DemandLoading() {
  return (
    <div role="status" aria-label="carregando" className="flex max-w-[520px] flex-col gap-[22px] py-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-4/5" />
      <div className="flex gap-1">
        {[64, 64, 76, 50].map((w, i) => (
          <Skeleton key={i} className="h-9 rounded-[10px]" style={{ width: w }} />
        ))}
      </div>
      <Skeleton className="h-[290px] rounded-[14px]" />
    </div>
  );
}
