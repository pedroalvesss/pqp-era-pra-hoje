import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "../authService/getCurrentUser";

export interface NotificationDTO {
  id: string;
  demandId: string | null;
  text: string;
  createdAt: number;
  unread: boolean;
}

export async function getNotifications(): Promise<NotificationDTO[]> {
  const { id } = await getCurrentUser();
  const rows = await db
    .select({
      id: notifications.id,
      demandId: notifications.demandId,
      text: notifications.text,
      createdAt: notifications.createdAt,
      readAt: notifications.readAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, id))
    .orderBy(desc(notifications.createdAt))
    .limit(100);
  return rows.map(({ readAt, createdAt, ...n }) => ({ ...n, createdAt: createdAt.getTime(), unread: !readAt }));
}
