import "server-only";
import { createClient } from "@/lib/supabase/server";
import { DEMAND_COLUMNS, mapDemand, type DemandColumns } from "./mapDemand";

export async function getDemandById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("demands").select(DEMAND_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapDemand(data as DemandColumns) : null;
}
