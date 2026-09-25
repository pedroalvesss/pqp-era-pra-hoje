import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { PrefsInput } from "@/lib/schemas";
import { withoutUndefined } from "@/lib/utils";
import { getCurrentUser } from "../authService/getCurrentUser";

export async function patchProfile(input: PrefsInput) {
  const { id } = await getCurrentUser();
  const patch = withoutUndefined({ pushEnabled: input.pushEnabled, lead: input.lead, workdayEnd: input.workdayEnd });
  if (Object.keys(patch).length) await db.update(users).set(patch).where(eq(users.id, id));
}
