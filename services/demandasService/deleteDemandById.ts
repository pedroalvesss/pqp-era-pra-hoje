import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function deleteDemandById(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("demands").delete().eq("id", id);
  if (error) throw error;
}
