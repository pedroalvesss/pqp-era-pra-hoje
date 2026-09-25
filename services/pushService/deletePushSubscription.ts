import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { getCurrentUser } from "../authService/getCurrentUser";

export async function deletePushSubscription(endpoint: string) {
  const { id } = await getCurrentUser();
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.userId, id)));
}
