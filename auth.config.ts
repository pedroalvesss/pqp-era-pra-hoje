import type { NextAuthConfig } from "next-auth";

export const PUBLIC_ROUTES = ["/entrar", "/criar-conta", "/redefinir-senha"];

/** Parte sem banco da config: roda no proxy. */
export const authConfig = {
  pages: { signIn: "/entrar" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isPublic = PUBLIC_ROUTES.includes(request.nextUrl.pathname);
      if (isPublic && auth?.user) return Response.redirect(new URL("/", request.nextUrl));
      return isPublic || !!auth?.user;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
} satisfies NextAuthConfig;
