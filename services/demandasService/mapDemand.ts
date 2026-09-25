import type { DemandDTO } from "@/lib/demand";
import type { DemandRow } from "@/lib/supabase/types";

export const DEMAND_COLUMNS = "id, title, due, prio, requester, project_id, company, dept, status, prev_status, notes";

export type DemandColumns = Pick<
  DemandRow,
  "id" | "title" | "due" | "prio" | "requester" | "project_id" | "company" | "dept" | "status" | "prev_status" | "notes"
>;

export function mapDemand(row: DemandColumns): DemandDTO {
  return {
    id: row.id,
    title: row.title,
    due: Date.parse(row.due),
    prio: row.prio,
    requester: row.requester,
    projectId: row.project_id,
    company: row.company,
    dept: row.dept,
    status: row.status,
    prevStatus: row.prev_status,
    notes: row.notes,
  };
}
