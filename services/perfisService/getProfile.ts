import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { Lead } from "@/lib/constants";
import { getCurrentUser } from "../authService/getCurrentUser";

export interface ProfileDTO {
  name: string;
  email: string;
  pushEnabled: boolean;
  lead: Lead;
  workdayEnd: string;
  timezone: string;
}

export const getProfile = cache(async (): Promise<ProfileDTO> => {
  const { id } = await getCurrentUser();
  const [user] = await db
    .select({
      name: users.name,
      email: users.email,
      pushEnabled: users.pushEnabled,
      lead: users.lead,
      workdayEnd: users.workdayEnd,
      timezone: users.timezone,
    })
    .from(users)
    .where(eq(users.id, id));
  // JWT válido de uma conta que não existe mais: derruba a sessão
  if (!user) redirect("/sair");
  return { ...user, workdayEnd: user.workdayEnd.slice(0, 5) };
});
