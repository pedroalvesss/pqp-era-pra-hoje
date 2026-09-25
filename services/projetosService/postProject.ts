import "server-only";
import { createClient } from "@/lib/supabase/server";
import { PROJECT_COLORS } from "@/lib/constants";

export async function postProject(name: string) {
  const supabase = await createClient();
  const { count, error: countError } = await supabase.from("projects").select("id", { count: "exact", head: true });
  if (countError) throw countError;
  const color = PROJECT_COLORS[(count ?? 0) % PROJECT_COLORS.length];
  const { error } = await supabase.from("projects").insert({ name, color });
  if (error) throw error;
}
