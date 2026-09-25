import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function postPushSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth });
  if (error) throw error;
}
