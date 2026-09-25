import "server-only";
import webpush from "web-push";
import { createAdminClient, env } from "@/lib/supabase/server";
import { reminderText, shouldRemind } from "@/lib/reminders";

export async function sendDueReminders(now = Date.now()) {
  const db = createAdminClient();
  webpush.setVapidDetails(env("VAPID_SUBJECT"), env("NEXT_PUBLIC_VAPID_PUBLIC_KEY"), env("VAPID_PRIVATE_KEY"));

  // 1 dia é a maior antecedência possível
  const { data: demands, error } = await db
    .from("demands")
    .select("id, user_id, title, due")
    .neq("status", "done")
    .is("notified_at", null)
    .lte("due", new Date(now + 864e5).toISOString())
    .gt("due", new Date(now - 3600000).toISOString());
  if (error) throw error;
  if (!demands.length) return { sent: 0 };

  const userIds = [...new Set(demands.map((d) => d.user_id))];
  const [{ data: profiles, error: pErr }, { data: subs, error: sErr }] = await Promise.all([
    db.from("profiles").select("id, lead, push_enabled").in("id", userIds),
    db.from("push_subscriptions").select("endpoint, user_id, p256dh, auth").in("user_id", userIds),
  ]);
  if (pErr) throw pErr;
  if (sErr) throw sErr;

  let sent = 0;
  for (const d of demands) {
    const profile = profiles.find((p) => p.id === d.user_id);
    if (!profile || !shouldRemind(Date.parse(d.due), profile.lead, now)) continue;

    const body = reminderText(d.title, (Date.parse(d.due) - now) / 60000);
    // marca antes de enviar: se o push falhar, melhor perder um aviso do que mandar em loop
    await db
      .from("demands")
      .update({ notified_at: new Date(now).toISOString() })
      .eq("id", d.id);
    await db.from("notifications").insert({ user_id: d.user_id, demand_id: d.id, text: body });
    if (!profile.push_enabled) continue;

    const payload = JSON.stringify({ title: "pqp, era pra hoje?", body, url: `/d/${d.id}` });
    for (const s of subs.filter((x) => x.user_id === d.user_id)) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await db.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
    }
  }
  return { sent };
}
