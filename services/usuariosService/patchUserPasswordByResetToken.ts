import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { hashPassword, hashToken } from "@/lib/password";

/** Troca a senha e queima todos os tokens do usuário. Devolve o e-mail, ou null se o token não vale. */
export async function patchUserPasswordByResetToken(token: string, password: string, now = Date.now()) {
  const [row] = await db
    .select({ userId: passwordResetTokens.userId, email: users.email })
    .from(passwordResetTokens)
    .innerJoin(users, eq(users.id, passwordResetTokens.userId))
    .where(and(eq(passwordResetTokens.tokenHash, hashToken(token)), gt(passwordResetTokens.expiresAt, new Date(now))));
  if (!row) return null;

  const passwordHash = await hashPassword(password);
  await db.transaction(async (tx) => {
    await tx.update(users).set({ passwordHash }).where(eq(users.id, row.userId));
    await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, row.userId));
  });
  return row.email;
}
