import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { demands } from "@/db/schema";
import type { UpdateDemandInput } from "@/lib/schemas";
import { withoutUndefined } from "@/lib/utils";
import { getCurrentUser } from "../authService/getCurrentUser";
import { assertProjectOwner } from "./assertProjectOwner";

type DemandPatch = Partial<typeof demands.$inferInsert>;

export async function patchDemandById(demandId: string, input: UpdateDemandInput) {
  const { id: userId } = await getCurrentUser();
  const own = and(eq(demands.id, demandId), eq(demands.userId, userId));
  await assertProjectOwner(userId, input.projectId);

  const { due, status, ...fields } = input;
  const patch: DemandPatch = withoutUndefined(fields);
  // prazo novo = avisos novos (antecedência e atraso)
  if (due !== undefined) Object.assign(patch, { due: new Date(due), notifiedAt: null, lateNotifiedAt: null });

  if (status !== undefined) {
    const [current] = await db.select({ status: demands.status }).from(demands).where(own);
    if (!current) throw new Error("demanda não encontrada");
    patch.status = status;
    if (status === "done" && current.status !== "done")
      Object.assign(patch, { prevStatus: current.status, doneAt: new Date() });
    if (status !== "done") patch.doneAt = null;
    // a espera conta de quando entrou em "esperando"; sair zera
    if (status === "waiting" && current.status !== "waiting") {
      Object.assign(patch, { waitingSince: new Date(), waitingNotifiedAt: null });
    }
    if (status !== "waiting") patch.waitingSince = null;
  }

  if (Object.keys(patch).length) await db.update(demands).set(patch).where(own);
}
