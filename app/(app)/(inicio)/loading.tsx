import { ListSkeleton, Skeleton } from "@/components/Skeleton";

export default function HomeLoading() {
  return (
    <>
      <div className="flex flex-col items-stretch gap-5 md:flex-row md:items-end md:gap-9">
        <Skeleton className="h-[128px] w-full flex-none rounded-[18px] md:h-[236px] md:w-[220px]" />
        <div className="flex flex-1 flex-col gap-[18px]">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-4/5 md:h-12" />
          <Skeleton className="h-[52px] w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="mx-3 h-6 w-20" />
        <ListSkeleton rows={4} />
      </div>
    </>
  );
}
