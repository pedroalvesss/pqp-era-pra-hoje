import "server-only";
import { db } from "@/db";
import { passwordResetTokens } from "@/db/schema";
import { newResetToken } from "@/lib/password";
import { getUserByEmail } from "./getUserByEmail";

const TTL_MS = 60 * 60 * 1000;

/** Cria o token de reset. Devolve null se o e-mail não tem conta. */
export async function postPasswordResetToken(email: string, now = Date.now()) {
  const user = await getUserByEmail(email);
  if (!user) return null;
  const { token, tokenHash } = newResetToken();
  await db.insert(passwordResetTokens).values({ tokenHash, userId: user.id, expiresAt: new Date(now + TTL_MS) });
  return { token, email: user.email };
}
