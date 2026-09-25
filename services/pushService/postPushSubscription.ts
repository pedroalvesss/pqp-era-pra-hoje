import "server-only";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { getCurrentUser } from "../authService/getCurrentUser";

export async function postPushSubscription(sub: { endpoint: string; keys: { p256dh: string; auth: string } }) {
  const { id: userId } = await getCurrentUser();
  const values = { endpoint: sub.endpoint, userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth };
  await db
    .insert(pushSubscriptions)
    .values(values)
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: values });
}
