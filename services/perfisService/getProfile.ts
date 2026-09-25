import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TZ, type Lead } from "@/lib/constants";
import { getCurrentUser } from "../authService/getCurrentUser";

export interface ProfileDTO {
  name: string;
  email: string;
  pushEnabled: boolean;
  lead: Lead;
  workdayEnd: string;
  timezone: string;
}

export const getProfile = cache(async (): Promise<ProfileDTO> => {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("name, push_enabled, lead, workday_end, timezone")
    .eq("id", user.id)
    .single();
  if (error) throw error;
  return {
    name: data.name || user.email.split("@")[0],
    email: user.email,
    pushEnabled: data.push_enabled,
    lead: data.lead,
    workdayEnd: data.workday_end.slice(0, 5),
    timezone: data.timezone || DEFAULT_TZ,
  };
});
