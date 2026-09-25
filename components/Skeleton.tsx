import type { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return <div aria-hidden="true" style={style} className={`animate-pulse rounded-lg bg-neutral-900 ${className}`} />;
}

/** Mesmo desenho da linha de demanda: check, "quando", título + meta, glifo. */
export function DemandRowSkeleton() {
  return (
    <div aria-hidden="true" className="flex items-center gap-3.5 px-3 py-[11px]">
      <Skeleton className="size-[22px] flex-none rounded-[7px]" />
      <div className="flex w-[62px] flex-none flex-col gap-1">
        <Skeleton className="h-2.5 w-9" />
        <Skeleton className="h-3.5 w-11" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <Skeleton className="h-3.5 w-3/5" />
        <Skeleton className="h-2.5 w-2/5" />
      </div>
    </div>
  );
}

interface ListSkeletonProps {
  rows?: number;
}

export function ListSkeleton({ rows = 5 }: ListSkeletonProps) {
  return (
    <div role="status" aria-label="carregando" className="flex flex-col">
      {Array.from({ length: rows }, (_, i) => (
        <DemandRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function TitleSkeleton() {
  return <Skeleton className="h-9 w-48 md:h-12 md:w-64" />;
}
