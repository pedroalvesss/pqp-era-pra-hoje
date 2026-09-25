"use server";

import { AuthError } from "next-auth";
import { headers } from "next/headers";
import { signIn, signOut } from "@/auth";
import { sendResetEmail } from "@/lib/mailer";
import {
  firstError,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/lib/schemas";
import { patchUserPasswordByResetToken } from "@/services/usuariosService/patchUserPasswordByResetToken";
import { postPasswordResetToken } from "@/services/usuariosService/postPasswordResetToken";
import { postUser } from "@/services/usuariosService/postUser";

export interface AuthState {
  error: string;
  info?: string;
}

/** Em sucesso o signIn lança o redirect do Next; só erro de credencial vira mensagem. */
async function signInOrError(email: string, password: string, redirectTo: string): Promise<AuthState> {
  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (e) {
    if (e instanceof AuthError) return { error: "e-mail ou senha errados." };
    throw e;
  }
  return { error: "" };
}

export async function login(input: LoginInput): Promise<AuthState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed.error) };
  return signInOrError(parsed.data.email, parsed.data.password, "/");
}

export async function register(input: RegisterInput & { timezone: string }): Promise<AuthState> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { name, email, password, timezone } = parsed.data;
  if (!(await postUser({ name, email, password, timezone }))) return { error: "esse e-mail já tem conta. entra?" };
  return signInOrError(email, password, "/?novo=1");
}

export async function forgotPassword(email: string): Promise<AuthState> {
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) return { error: firstError(parsed.error) };
  const reset = await postPasswordResetToken(parsed.data.email);
  if (reset) {
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
    await sendResetEmail(reset.email, `${origin}/redefinir-senha?token=${reset.token}`);
  }
  // mesma resposta exista ou não a conta, pra não entregar quem tem cadastro
  return { error: "", info: "relaxa, mandamos um link pro seu e-mail." };
}

export async function updatePassword(token: string, input: ResetPasswordInput): Promise<AuthState> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const email = await patchUserPasswordByResetToken(token, parsed.data.password);
  if (!email) return { error: "esse link expirou. pede outro?" };
  return signInOrError(email, parsed.data.password, "/");
}

export async function logout() {
  await signOut({ redirectTo: "/entrar" });
}
