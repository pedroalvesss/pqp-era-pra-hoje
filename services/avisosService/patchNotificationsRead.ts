import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "../authService/getCurrentUser";

/** Sem id, marca todas. */
export async function patchNotificationsRead(notificationId?: string) {
  const { id } = await getCurrentUser();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.userId, id),
        isNull(notifications.readAt),
        notificationId ? eq(notifications.id, notificationId) : undefined,
      ),
    );
}
