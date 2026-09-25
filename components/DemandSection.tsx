import type { ReactNode } from "react";
import type { DemandDTO, ProjectDTO } from "@/lib/demand";
import { DemandRow } from "./DemandRow";

interface DemandSectionProps {
  title: string;
  titleClassName?: string;
  demands: DemandDTO[];
  projects: ProjectDTO[];
  empty?: ReactNode;
}

export function DemandSection({ title, titleClassName = "", demands, projects, empty }: DemandSectionProps) {
  return (
    <section className="flex flex-col" aria-label={title}>
      <div className="flex items-baseline gap-1.5 px-3 pb-1.5">
        <h2 className={`text-[22px] font-medium tracking-[-0.03em] ${titleClassName}`}>{title}</h2>
        <span className="tabular text-[13px] text-neutral-500">{demands.length}</span>
      </div>
      {demands.map((d) => (
        <DemandRow key={d.id} demand={d} projects={projects} />
      ))}
      {demands.length === 0 && empty}
    </section>
  );
}
