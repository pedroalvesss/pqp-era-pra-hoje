import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ProjectDTO } from "@/lib/demand";

export const getProjects = cache(async (): Promise<ProjectDTO[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("id, name, color").order("created_at");
  if (error) throw error;
  return data;
});
