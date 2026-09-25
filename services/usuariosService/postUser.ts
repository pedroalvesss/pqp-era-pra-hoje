import "server-only";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";

interface NewUser {
  name: string;
  email: string;
  password: string;
  timezone: string;
}

/** Devolve false se o e-mail já tem conta. */
export async function postUser(input: NewUser) {
  const rows = await db
    .insert(users)
    .values({
      name: input.name,
      email: input.email.trim().toLowerCase(),
      passwordHash: await hashPassword(input.password),
      timezone: input.timezone,
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });
  return rows.length > 0;
}
