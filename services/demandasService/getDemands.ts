import "server-only";
import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { demands } from "@/db/schema";
import { getCurrentUser } from "../authService/getCurrentUser";
import { DEMAND_COLUMNS, mapDemand } from "./mapDemand";

// ponytail: traz tudo do usuário; paginar quando passar de alguns milhares de demandas
export const getDemands = cache(async () => {
  const { id } = await getCurrentUser();
  const rows = await db.select(DEMAND_COLUMNS).from(demands).where(eq(demands.userId, id)).orderBy(asc(demands.due));
  return rows.map(mapDemand);
});
