import { signOut } from "@/auth";

// Server Component não apaga cookie; sessão de usuário que não existe mais cai aqui
export async function GET() {
  await signOut({ redirectTo: "/entrar" });
}
