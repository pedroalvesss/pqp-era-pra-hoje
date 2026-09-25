import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { demands } from "@/db/schema";
import { getCurrentUser } from "../authService/getCurrentUser";

export async function deleteDemandById(demandId: string) {
  const { id } = await getCurrentUser();
  await db.delete(demands).where(and(eq(demands.id, demandId), eq(demands.userId, id)));
}
