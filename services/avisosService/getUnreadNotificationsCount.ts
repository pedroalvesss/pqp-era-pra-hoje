import "server-only";
import { cache } from "react";
import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "../authService/getCurrentUser";

export const getUnreadNotificationsCount = cache(async () => {
  const { id } = await getCurrentUser();
  const [{ total }] = await db
    .select({ total: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, id), isNull(notifications.readAt)));
  return total;
});
