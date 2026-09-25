import "server-only";
import { createClient } from "@/lib/supabase/server";

/** Sem id, marca todas. */
export async function patchNotificationsRead(id?: string) {
  const supabase = await createClient();
  let query = supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
  if (id) query = query.eq("id", id);
  const { error } = await query;
  if (error) throw error;
}
