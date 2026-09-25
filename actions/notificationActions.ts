"use server";

import { idSchema } from "@/lib/schemas";
import { patchNotificationsRead } from "@/services/avisosService/patchNotificationsRead";
import { mutate, type ActionResult } from "./result";

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false, error: "aviso não encontrado." };
  return mutate(() => patchNotificationsRead(parsed.data));
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  return mutate(() => patchNotificationsRead());
}
