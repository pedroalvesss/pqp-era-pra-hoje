import Link from "next/link";
import type { ProjectCardData } from "./projectStats";

interface ProjectCardProps {
  project: ProjectCardData;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/demandas?projeto=${project.id}`}
      className="bg-surface text-text hover:text-text flex flex-col overflow-hidden rounded-2xl no-underline hover:shadow-md"
    >
      <span aria-hidden="true" className="h-3 w-full" style={{ background: project.color }} />
      <span className="flex w-full flex-col gap-3.5 px-4 pt-3.5 pb-4">
        <span className="text-base font-medium">{project.name.toLowerCase()}</span>
        <span className="flex items-baseline gap-1.5">
          <span className="tabular text-[40px] leading-[.9] font-medium tracking-[-0.05em]">{project.open}</span>
          <span className="text-[13px] text-neutral-400">abertas</span>
        </span>
        <span className={`text-[13px] ${project.forToday ? "text-accent" : "text-neutral-500"}`}>
          {project.forToday ? `${project.forToday} pra hoje` : "nada pra hoje"}
        </span>
      </span>
    </Link>
  );
}
