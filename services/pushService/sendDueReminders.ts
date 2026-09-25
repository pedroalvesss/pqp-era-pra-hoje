import "server-only";
import { and, eq, gt, inArray, isNull, lte, ne } from "drizzle-orm";
import webpush from "web-push";
import { db } from "@/db";
import { demands, notifications, pushSubscriptions, users } from "@/db/schema";
import { env } from "@/lib/env";
import { reminderText, shouldRemind } from "@/lib/reminders";

/** Roda sem sessão (chamado pelo cron): olha as demandas de todo mundo. */
export async function sendDueReminders(now = Date.now()) {
  webpush.setVapidDetails(env("VAPID_SUBJECT"), env("NEXT_PUBLIC_VAPID_PUBLIC_KEY"), env("VAPID_PRIVATE_KEY"));

  // 1 dia é a maior antecedência possível
  const pending = await db
    .select({
      id: demands.id,
      userId: demands.userId,
      title: demands.title,
      due: demands.due,
      lead: users.lead,
      pushEnabled: users.pushEnabled,
    })
    .from(demands)
    .innerJoin(users, eq(users.id, demands.userId))
    .where(
      and(
        ne(demands.status, "done"),
        isNull(demands.notifiedAt),
        lte(demands.due, new Date(now + 864e5)),
        gt(demands.due, new Date(now - 3600000)),
      ),
    );
  const due = pending.filter((d) => shouldRemind(d.due.getTime(), d.lead, now));
  if (!due.length) return { sent: 0 };

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(inArray(pushSubscriptions.userId, [...new Set(due.map((d) => d.userId))]));

  let sent = 0;
  for (const d of due) {
    const body = reminderText(d.title, (d.due.getTime() - now) / 60000);
    // marca antes de enviar: se o push falhar, melhor perder um aviso do que mandar em loop
    await db
      .update(demands)
      .set({ notifiedAt: new Date(now) })
      .where(eq(demands.id, d.id));
    await db.insert(notifications).values({ userId: d.userId, demandId: d.id, text: body });
    if (!d.pushEnabled) continue;

    const payload = JSON.stringify({ title: "pqp, era pra hoje?", body, url: `/d/${d.id}` });
    for (const s of subs.filter((x) => x.userId === d.userId)) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        sent++;
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, s.endpoint));
        }
      }
    }
  }
  return { sent };
}
