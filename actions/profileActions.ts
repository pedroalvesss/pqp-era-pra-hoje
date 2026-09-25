"use server";

import { firstError, prefsSchema, pushSubscriptionSchema, type PrefsInput } from "@/lib/schemas";
import { patchProfile } from "@/services/perfisService/patchProfile";
import { postPushSubscription } from "@/services/pushService/postPushSubscription";
import { deletePushSubscription } from "@/services/pushService/deletePushSubscription";
import { mutate, type ActionResult } from "./result";

export async function updatePrefs(input: PrefsInput): Promise<ActionResult> {
  const parsed = prefsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  return mutate(() => patchProfile(parsed.data));
}

export async function subscribePush(subscription: unknown): Promise<ActionResult> {
  const parsed = pushSubscriptionSchema.safeParse(subscription);
  if (!parsed.success) return { ok: false, error: "esse navegador não quis assinar o push." };
  return mutate(() => postPushSubscription(parsed.data));
}

export async function unsubscribePush(endpoint: string): Promise<ActionResult> {
  if (!endpoint) return { ok: false, error: "nada pra cancelar." };
  return mutate(() => deletePushSubscription(endpoint));
}
