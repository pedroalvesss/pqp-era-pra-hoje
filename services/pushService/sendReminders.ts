import "server-only";
import { and, eq, gt, inArray, isNull, lt, lte, ne } from "drizzle-orm";
import webpush from "web-push";
import { db } from "@/db";
import { demands, notifications, pushSubscriptions, users } from "@/db/schema";
import { dayDiff } from "@/lib/dates";
import { env } from "@/lib/env";
import {
  LATE_MAX_DAYS,
  WAITING_DAYS,
  isNudgeTime,
  lateText,
  reminderText,
  shouldRemind,
  waitingText,
} from "@/lib/reminders";

const DAY_MS = 864e5;

interface Reminder {
  demandId: string;
  userId: string;
  pushEnabled: boolean;
  body: string;
  /** Coluna que marca "já avisei", pra não repetir. */
  mark: Partial<typeof demands.$inferInsert>;
}

const base = {
  id: demands.id,
  userId: demands.userId,
  title: demands.title,
  pushEnabled: users.pushEnabled,
  tz: users.timezone,
};

/** Lembrete de prazo, na antecedência do perfil. */
async function dueReminders(now: number): Promise<Reminder[]> {
  // 1 dia é a maior antecedência possível
  const rows = await db
    .select({ ...base, due: demands.due, lead: users.lead })
    .from(demands)
    .innerJoin(users, eq(users.id, demands.userId))
    .where(
      and(
        ne(demands.status, "done"),
        isNull(demands.notifiedAt),
        lte(demands.due, new Date(now + DAY_MS)),
        gt(demands.due, new Date(now - 3600000)),
      ),
    );
  return rows
    .filter((d) => shouldRemind(d.due.getTime(), d.lead, now))
    .map((d) => ({
      demandId: d.id,
      userId: d.userId,
      pushEnabled: d.pushEnabled,
      body: reminderText(d.title, (d.due.getTime() - now) / 60000),
      mark: { notifiedAt: new Date(now) },
    }));
}

/** Atrasada: uma vez, na manhã seguinte ao vencimento. */
async function lateReminders(now: number): Promise<Reminder[]> {
  const rows = await db
    .select({ ...base, due: demands.due })
    .from(demands)
    .innerJoin(users, eq(users.id, demands.userId))
    .where(
      and(
        ne(demands.status, "done"),
        isNull(demands.lateNotifiedAt),
        lt(demands.due, new Date(now)),
        gt(demands.due, new Date(now - (LATE_MAX_DAYS + 1) * DAY_MS)),
      ),
    );
  return rows.flatMap((d) => {
    const daysLate = -dayDiff(d.due.getTime(), now, d.tz);
    if (daysLate < 1 || daysLate > LATE_MAX_DAYS || !isNudgeTime(now, d.tz)) return [];
    return [
      {
        demandId: d.id,
        userId: d.userId,
        pushEnabled: d.pushEnabled,
        body: lateText(d.title, daysLate),
        mark: { lateNotifiedAt: new Date(now) },
      },
    ];
  });
}

/** Esperando alguém há 2+ dias: uma vez por período de espera. */
async function waitingReminders(now: number): Promise<Reminder[]> {
  const rows = await db
    .select({ ...base, requester: demands.requester, waitingSince: demands.waitingSince })
    .from(demands)
    .innerJoin(users, eq(users.id, demands.userId))
    .where(
      and(
        eq(demands.status, "waiting"),
        isNull(demands.waitingNotifiedAt),
        lte(demands.waitingSince, new Date(now - WAITING_DAYS * DAY_MS)),
      ),
    );
  return rows
    .filter((d) => isNudgeTime(now, d.tz))
    .map((d) => ({
      demandId: d.id,
      userId: d.userId,
      pushEnabled: d.pushEnabled,
      body: waitingText(d.title, d.requester, Math.floor((now - d.waitingSince!.getTime()) / DAY_MS)),
      mark: { waitingNotifiedAt: new Date(now) },
    }));
}

/** Roda sem sessão (chamado pelo cron): olha as demandas de todo mundo. */
export async function sendReminders(now = Date.now()) {
  webpush.setVapidDetails(env("VAPID_SUBJECT"), env("NEXT_PUBLIC_VAPID_PUBLIC_KEY"), env("VAPID_PRIVATE_KEY"));

  const reminders = (await Promise.all([dueReminders(now), lateReminders(now), waitingReminders(now)])).flat();
  if (!reminders.length) return { notified: 0, sent: 0 };

  const subs = await db
    .select()
    .from(pushSubscriptions)
    .where(inArray(pushSubscriptions.userId, [...new Set(reminders.map((r) => r.userId))]));

  let sent = 0;
  for (const r of reminders) {
    // marca antes de enviar: se o push falhar, melhor perder um aviso do que mandar em loop
    await db.update(demands).set(r.mark).where(eq(demands.id, r.demandId));
    await db.insert(notifications).values({ userId: r.userId, demandId: r.demandId, text: r.body });
    if (!r.pushEnabled) continue;

    const payload = JSON.stringify({ title: "pqp, era pra hoje?", body: r.body, url: `/d/${r.demandId}` });
    for (const s of subs.filter((x) => x.userId === r.userId)) {
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
  return { notified: reminders.length, sent };
}
