"use server";

import type { DemandDTO } from "@/lib/demand";
import { dueFrom } from "@/lib/dates";
import {
  createDemandSchema,
  demandSnapshotSchema,
  firstError,
  idSchema,
  quickDemandSchema,
  updateDemandSchema,
  type CreateDemandInput,
  type UpdateDemandInput,
} from "@/lib/schemas";
import { getProfile } from "@/services/perfisService/getProfile";
import { postDemand } from "@/services/demandasService/postDemand";
import { patchDemandById } from "@/services/demandasService/patchDemandById";
import { deleteDemandById } from "@/services/demandasService/deleteDemandById";
import { postDemandRestore } from "@/services/demandasService/postDemandRestore";
import { mutate, type ActionResult } from "./result";

export type CreateResult = { ok: true; id: string } | { ok: false; error: string };

export async function createDemand(input: CreateDemandInput): Promise<CreateResult> {
  const parsed = createDemandSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const { day, date, time, ...rest } = parsed.data;
  const profile = await getProfile();
  let id = "";
  const result = await mutate(async () => {
    id = await postDemand({ ...rest, due: dueFrom(day, time, Date.now(), profile.timezone, date) });
  });
  return result.ok ? { ok: true, id } : result;
}

/** Anotação rápida: hoje, no fim do expediente, prioridade média. */
export async function quickCreateDemand(title: string): Promise<CreateResult> {
  const parsed = quickDemandSchema.safeParse({ title });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const profile = await getProfile();
  return createDemand({
    title: parsed.data.title,
    day: "hoje",
    date: null,
    time: profile.workdayEnd,
    prio: "media",
    requester: "",
    projectId: null,
    company: null,
    dept: null,
  });
}

export async function updateDemand(id: string, input: UpdateDemandInput): Promise<ActionResult> {
  const parsedId = idSchema.safeParse(id);
  const parsed = updateDemandSchema.safeParse(input);
  if (!parsedId.success) return { ok: false, error: "demanda não encontrada." };
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  return mutate(() => patchDemandById(parsedId.data, parsed.data));
}

export async function deleteDemand(id: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "demanda não encontrada." };
  return mutate(() => deleteDemandById(parsed.data));
}

export async function restoreDemand(snapshot: DemandDTO): Promise<ActionResult> {
  const parsed = demandSnapshotSchema.safeParse(snapshot);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  return mutate(() => postDemandRestore(parsed.data));
}
