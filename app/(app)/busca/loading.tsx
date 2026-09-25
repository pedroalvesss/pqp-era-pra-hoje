import { Skeleton } from "@/components/Skeleton";

export default function SearchLoading() {
  return (
    <>
      <div className="border-divider flex h-16 items-center border-b">
        <Skeleton className="h-9 w-40 md:h-11" />
      </div>
      <div role="status" aria-label="carregando" className="-mt-3 flex gap-1.5">
        {[56, 64, 80].map((w, i) => (
          <Skeleton key={i} className="h-[34px] rounded-[10px]" style={{ width: w }} />
        ))}
      </div>
    </>
  );
}
