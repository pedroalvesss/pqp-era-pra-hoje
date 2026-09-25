import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PrefsInput } from "@/lib/schemas";
import { withoutUndefined } from "@/lib/utils";
import { getCurrentUser } from "../authService/getCurrentUser";

export async function patchProfile(input: PrefsInput) {
  const user = await getCurrentUser();
  const supabase = await createClient();
  const patch = withoutUndefined({ push_enabled: input.pushEnabled, lead: input.lead, workday_end: input.workdayEnd });
  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
  if (error) throw error;
}
