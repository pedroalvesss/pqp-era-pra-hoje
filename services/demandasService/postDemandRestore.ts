import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { DemandDTO } from "@/lib/demand";

/** Recria uma demanda apagada (o "desfazer"), com o mesmo id. */
export async function postDemandRestore(d: DemandDTO) {
  const supabase = await createClient();
  const { error } = await supabase.from("demands").insert({
    id: d.id,
    title: d.title,
    due: new Date(d.due).toISOString(),
    prio: d.prio,
    requester: d.requester,
    project_id: d.projectId,
    company: d.company,
    dept: d.dept,
    status: d.status,
    prev_status: d.prevStatus,
    notes: d.notes,
  });
  if (error) throw error;
}
