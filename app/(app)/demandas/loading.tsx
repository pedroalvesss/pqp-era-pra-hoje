import { ListSkeleton, Skeleton, TitleSkeleton } from "@/components/Skeleton";

export default function DemandsLoading() {
  return (
    <>
      <TitleSkeleton />
      <div className="flex flex-wrap gap-1.5">
        {[64, 72, 76, 86, 64].map((w, i) => (
          <Skeleton key={i} className="h-[34px] rounded-[10px]" style={{ width: w }} />
        ))}
      </div>
      <div className="-mt-3">
        <ListSkeleton rows={7} />
      </div>
    </>
  );
}
