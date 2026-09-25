import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Company, Dept, Prio } from "@/lib/constants";

export interface NewDemand {
  title: string;
  due: number;
  prio: Prio;
  requester: string;
  projectId: string | null;
  company: Company | null;
  dept: Dept | null;
}

export async function postDemand(input: NewDemand) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("demands")
    .insert({
      title: input.title,
      due: new Date(input.due).toISOString(),
      prio: input.prio,
      requester: input.requester,
      project_id: input.projectId,
      company: input.company,
      dept: input.dept,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}
