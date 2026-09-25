import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface NotificationDTO {
  id: string;
  demandId: string | null;
  text: string;
  createdAt: number;
  unread: boolean;
}

export async function getNotifications(): Promise<NotificationDTO[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, demand_id, text, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data.map((n) => ({
    id: n.id,
    demandId: n.demand_id,
    text: n.text,
    createdAt: Date.parse(n.created_at),
    unread: !n.read_at,
  }));
}
