import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UpdateDemandInput } from "@/lib/schemas";
import type { DemandRow } from "@/lib/supabase/types";
import { withoutUndefined } from "@/lib/utils";

export async function patchDemandById(id: string, input: UpdateDemandInput) {
  const supabase = await createClient();
  const patch: Partial<DemandRow> = {
    title: input.title,
    prio: input.prio,
    requester: input.requester,
    project_id: input.projectId,
    company: input.company,
    dept: input.dept,
    notes: input.notes,
  };
  // prazo novo = aviso novo
  if (input.due !== undefined) Object.assign(patch, { due: new Date(input.due).toISOString(), notified_at: null });

  if (input.status !== undefined) {
    const { data: current, error } = await supabase.from("demands").select("status").eq("id", id).single();
    if (error) throw error;
    patch.status = input.status;
    if (input.status === "done" && current.status !== "done") {
      Object.assign(patch, { prev_status: current.status, done_at: new Date().toISOString() });
    }
    if (input.status !== "done") patch.done_at = null;
  }

  const { error } = await supabase.from("demands").update(withoutUndefined(patch)).eq("id", id);
  if (error) throw error;
}
