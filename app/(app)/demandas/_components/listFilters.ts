import { STATUSES, type Status } from "@/lib/constants";
import { sortDemands, type DemandDTO } from "@/lib/demand";

export type StatusFilter = Status | "all";

export const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "todas" },
  { id: "todo", label: "a fazer" },
  { id: "doing", label: "fazendo" },
  { id: "waiting", label: "esperando" },
  { id: "done", label: "feitas" },
];

export function parseStatus(value: unknown): StatusFilter {
  return STATUSES.includes(value as Status) ? (value as Status) : "all";
}

export function filterHref(status: StatusFilter, project: string | null) {
  const params = new URLSearchParams();
  if (status !== "all") params.set("status", status);
  if (project) params.set("projeto", project);
  const qs = params.toString();
  return qs ? `/demandas?${qs}` : "/demandas";
}

/** Contadores respeitam o filtro de projeto; a lista respeita os dois. */
export function applyFilters(demands: DemandDTO[], status: StatusFilter, project: string | null) {
  const inProject = sortDemands(demands).filter((d) => !project || d.projectId === project);
  const counts = Object.fromEntries(
    STATUS_FILTERS.map(({ id }) => [
      id,
      id === "all" ? inProject.length : inProject.filter((d) => d.status === id).length,
    ]),
  ) as Record<StatusFilter, number>;
  const list = status === "all" ? inProject : inProject.filter((d) => d.status === status);
  return { list, counts };
}
