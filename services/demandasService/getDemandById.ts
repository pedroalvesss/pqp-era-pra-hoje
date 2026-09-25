import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { demands } from "@/db/schema";
import { getCurrentUser } from "../authService/getCurrentUser";
import { DEMAND_COLUMNS, mapDemand } from "./mapDemand";

export async function getDemandById(demandId: string) {
  const { id } = await getCurrentUser();
  const [row] = await db
    .select(DEMAND_COLUMNS)
    .from(demands)
    .where(and(eq(demands.id, demandId), eq(demands.userId, id)));
  return row ? mapDemand(row) : null;
}
