import { demands } from "@/db/schema";
import type { DemandDTO } from "@/lib/demand";

/** Só as colunas que as telas usam (nada de user_id, notified_at...). */
export const DEMAND_COLUMNS = {
  id: demands.id,
  title: demands.title,
  due: demands.due,
  prio: demands.prio,
  requester: demands.requester,
  projectId: demands.projectId,
  company: demands.company,
  dept: demands.dept,
  status: demands.status,
  prevStatus: demands.prevStatus,
  notes: demands.notes,
};

export type DemandRow = Omit<DemandDTO, "due"> & { due: Date };

export function mapDemand(row: DemandRow): DemandDTO {
  return { ...row, due: row.due.getTime() };
}
