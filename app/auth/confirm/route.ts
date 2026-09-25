import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// destino dos links de e-mail (confirmar conta, trocar senha)
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  // só caminho interno, nada de redirecionar pra fora
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, request.url));
  }
  return NextResponse.redirect(new URL("/entrar?link=expirado", request.url));
}
