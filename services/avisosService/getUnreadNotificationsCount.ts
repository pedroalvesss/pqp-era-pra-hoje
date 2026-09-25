import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getUnreadNotificationsCount = cache(async () => {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);
  if (error) throw error;
  return count ?? 0;
});
