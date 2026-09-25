import { Skeleton, TitleSkeleton } from "@/components/Skeleton";

export default function ProjectsLoading() {
  return (
    <>
      <TitleSkeleton />
      <div
        role="status"
        aria-label="carregando"
        className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3.5"
      >
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[150px] rounded-2xl" />
        ))}
      </div>
    </>
  );
}
