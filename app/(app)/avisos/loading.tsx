import { Skeleton, TitleSkeleton } from "@/components/Skeleton";

export default function NotificationsLoading() {
  return (
    <>
      <TitleSkeleton />
      <div role="status" aria-label="carregando" className="-mt-2 flex flex-col">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-baseline gap-3.5 p-3">
            <Skeleton className="size-2 flex-none rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-3 w-8 flex-none" />
          </div>
        ))}
      </div>
    </>
  );
}
