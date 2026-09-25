import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEMAND_COLUMNS, mapDemand, type DemandColumns } from "./mapDemand";

// ponytail: traz tudo do usuário; paginar quando passar de alguns milhares de demandas
export const getDemands = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("demands").select(DEMAND_COLUMNS).order("due");
  if (error) throw error;
  return (data as DemandColumns[]).map(mapDemand);
});
