import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

export function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`faltou a variável de ambiente ${name}`);
  return value;
}

// o browser nunca fala com o Supabase: a sessão fica em cookie httpOnly e só o servidor lê
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const;

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(env("SUPABASE_URL"), env("SUPABASE_PUBLISHABLE_KEY"), {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, { ...options, ...AUTH_COOKIE_OPTIONS }),
          );
        } catch {
          // Server Component não escreve cookie; o proxy renova a sessão.
        }
      },
    },
  });
}

/** Ignora RLS. Só para o cron de push. */
export function createAdminClient() {
  return createSupabaseClient<Database>(env("SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
