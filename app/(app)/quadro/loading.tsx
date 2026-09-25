import { Skeleton, TitleSkeleton } from "@/components/Skeleton";

export default function BoardLoading() {
  return (
    <>
      <TitleSkeleton />
      <div role="status" aria-label="carregando" className="-mt-2 flex gap-4 overflow-hidden">
        {[3, 2, 2, 1].map((cards, i) => (
          <div key={i} className="flex flex-[0_0_84%] flex-col gap-2 p-1.5 md:flex-[1_0_200px]">
            <Skeleton className="mx-1.5 my-1 h-5 w-20" />
            {Array.from({ length: cards }, (_, j) => (
              <Skeleton key={j} className="h-[92px] rounded-xl" />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
