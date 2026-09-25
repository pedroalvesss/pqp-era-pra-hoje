import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/entrar", "/criar-conta"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const cookieOptions = { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" } as const;

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions,
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, { ...options, ...cookieOptions }));
      },
    },
  });

  // getClaims valida o JWT e renova a sessão quando precisa
  const { data } = await supabase.auth.getClaims();
  const isPublic = PUBLIC.includes(request.nextUrl.pathname);

  if (!data?.claims && !isPublic) return redirectKeepingCookies("/entrar", request, response);
  if (data?.claims && isPublic) return redirectKeepingCookies("/", request, response);
  return response;
}

// sem copiar, um refresh token recém-rotacionado se perde e a sessão cai
function redirectKeepingCookies(path: string, request: NextRequest, from: NextResponse) {
  const redirect = NextResponse.redirect(new URL(path, request.url));
  from.cookies.getAll().forEach((c) => redirect.cookies.set(c));
  return redirect;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/cron|auth/|sw.js|manifest.webmanifest|icon|apple-icon|icons/|favicon.ico).*)",
  ],
};
