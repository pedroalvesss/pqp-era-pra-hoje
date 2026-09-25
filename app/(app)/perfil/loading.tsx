import { Skeleton } from "@/components/Skeleton";

export default function ProfileLoading() {
  return (
    <>
      <div role="status" aria-label="carregando" className="flex items-center gap-3.5">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <Skeleton className="h-[170px] max-w-[560px] rounded-2xl" />
    </>
  );
}
