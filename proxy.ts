import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

// só confere o JWT do cookie; sem logar manda pra /entrar (callbacks.authorized)
export default auth;

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|api/auth|api/cron|sw.js|manifest.webmanifest|icon|apple-icon|icons/|favicon.ico).*)",
  ],
};
