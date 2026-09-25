import "server-only";
import { db } from "@/db";
import { demands } from "@/db/schema";
import type { DemandDTO } from "@/lib/demand";
import { getCurrentUser } from "../authService/getCurrentUser";
import { assertProjectOwner } from "./assertProjectOwner";

/** Recria uma demanda apagada (o "desfazer"), com o mesmo id. */
export async function postDemandRestore(d: DemandDTO) {
  const { id: userId } = await getCurrentUser();
  await assertProjectOwner(userId, d.projectId);
  const waitingSince = d.status === "waiting" ? new Date() : null;
  await db.insert(demands).values({ ...d, userId, due: new Date(d.due), waitingSince });
}
