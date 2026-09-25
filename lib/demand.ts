import type { Company, Dept, Prio, Status } from "./constants";
import { STATUS_LABEL } from "./constants";
import { dayDiff, dayName, hm } from "./dates";

/** O que as telas recebem do servidor. Nada além disso sai do back. */
export interface DemandDTO {
  id: string;
  title: string;
  due: number;
  prio: Prio;
  requester: string;
  projectId: string | null;
  company: Company | null;
  dept: Dept | null;
  status: Status;
  prevStatus: Status | null;
  notes: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  color: string;
}

export type WhenTone = "done" | "late" | "today" | "future";

export interface WhenInfo {
  top: string;
  time: string;
  tone: WhenTone;
}

export function describeWhen(d: Pick<DemandDTO, "due" | "status">, now: number, tz: string): WhenInfo {
  const dd = dayDiff(d.due, now, tz);
  const time = hm(d.due, tz);
  if (d.status === "done") return { top: "feito", time, tone: "done" };
  if (d.due < now) return { top: dd === 0 ? "venceu" : dayName(d.due, now, tz), time, tone: "late" };
  if (dd === 0) {
    const min = Math.round((d.due - now) / 60000);
    return { top: min <= 90 ? `em ${min} min` : "hoje", time, tone: "today" };
  }
  return { top: dayName(d.due, now, tz), time, tone: "future" };
}

export function projectLabel(projects: ProjectDTO[], id: string | null) {
  return projects.find((p) => p.id === id)?.name.toLowerCase() ?? "sem projeto";
}

export function demandMeta(d: DemandDTO, projects: ProjectDTO[], withStatus = false) {
  const status = withStatus && d.status !== "done" ? STATUS_LABEL[d.status] : "";
  return [status, d.company, projectLabel(projects, d.projectId), d.requester].filter(Boolean).join(" · ");
}

/** Abertas por prazo crescente, feitas no fim. */
export function sortDemands<T extends Pick<DemandDTO, "status" | "due">>(list: T[]) {
  return [...list].sort((a, b) => Number(a.status === "done") - Number(b.status === "done") || a.due - b.due);
}

export function groupForHome(list: DemandDTO[], now: number, tz: string) {
  const open = sortDemands(list).filter((d) => d.status !== "done");
  return {
    late: open.filter((d) => d.due < now),
    today: open.filter((d) => d.due >= now && dayDiff(d.due, now, tz) === 0),
    upcoming: open.filter((d) => {
      const dd = dayDiff(d.due, now, tz);
      return dd >= 1 && dd <= 7;
    }),
    todayDone: list.filter((d) => d.status === "done" && dayDiff(d.due, now, tz) === 0).length,
  };
}

export function heroLine(today: number, late: number) {
  const vence = `${today} ${today === 1 ? "vence" : "vencem"} hoje.`;
  if (late > 0) return today > 0 ? `${vence} ${late} já era.` : `${late} já era. o resto tá em dia.`;
  return today > 0 ? `${vence} bora.` : "relaxa, hoje tá tranquilo.";
}

export function matchesQuery(d: DemandDTO, projects: ProjectDTO[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return false;
  const project = projects.find((p) => p.id === d.projectId)?.name ?? "";
  return [d.title, d.requester, project, d.company, d.dept, d.notes].join(" ").toLowerCase().includes(q);
}

export function nextStatus(s: Status): Status {
  const order: Status[] = ["todo", "doing", "waiting", "done"];
  return order[Math.min(3, order.indexOf(s) + 1)];
}
