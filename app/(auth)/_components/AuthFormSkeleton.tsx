import { Skeleton } from "@/components/Skeleton";

interface AuthFormSkeletonProps {
  fields?: number;
}

export function AuthFormSkeleton({ fields = 2 }: AuthFormSkeletonProps) {
  return (
    <div role="status" aria-label="carregando" className="flex flex-col gap-3.5">
      <Skeleton className="mb-2 h-10 w-40" />
      {Array.from({ length: fields }, (_, i) => (
        <Skeleton key={i} className="h-12 rounded-xl" />
      ))}
      <Skeleton className="mt-1 h-12 rounded-xl" />
    </div>
  );
}
