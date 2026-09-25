"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { firstError, loginSchema, registerSchema } from "@/lib/schemas";
import { z } from "zod";

export interface AuthState {
  error: string;
  info?: string;
}

async function origin() {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

export async function login(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "e-mail ou senha errados." };
  redirect("/");
}

export async function register(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { name, email, password, timezone } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, timezone }, emailRedirectTo: `${await origin()}/auth/confirm` },
  });
  if (error) return { error: "não rolou criar a conta. esse e-mail já existe?" };
  if (!data.session) return { error: "", info: "confere teu e-mail pra confirmar a conta." };
  redirect("/?novo=1");
}

export async function forgotPassword(email: string): Promise<AuthState> {
  const parsed = z.email().safeParse(email);
  if (!parsed.success) return { error: "esse e-mail tá estranho." };
  const supabase = await createClient();
  // mesma resposta exista ou não a conta, pra não entregar quem tem cadastro
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${await origin()}/auth/confirm?next=/redefinir-senha`,
  });
  return { error: "", info: "relaxa, mandamos um link pro seu e-mail." };
}

export async function updatePassword(_: AuthState, form: FormData): Promise<AuthState> {
  const parsed = z
    .object({ password: z.string().min(6, "senha com pelo menos 6 caracteres."), password2: z.string() })
    .refine((v) => v.password === v.password2, { message: "as senhas não bateram." })
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: "não rolou trocar a senha. pede outro link?" };
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/entrar");
}
