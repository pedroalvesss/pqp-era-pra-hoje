import { dayDiff } from "@/lib/dates";
import type { DemandDTO, ProjectDTO } from "@/lib/demand";

export interface ProjectCardData extends ProjectDTO {
  open: number;
  forToday: number;
}

/** "pra hoje" conta o que vence hoje e o que já passou. */
export function projectStats(projects: ProjectDTO[], demands: DemandDTO[], now: number, tz: string): ProjectCardData[] {
  return projects.map((p) => {
    const open = demands.filter((d) => d.projectId === p.id && d.status !== "done");
    return { ...p, open: open.length, forToday: open.filter((d) => dayDiff(d.due, now, tz) <= 0).length };
  });
}
