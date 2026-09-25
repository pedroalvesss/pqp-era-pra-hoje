import type { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = { title: "entra aí · pqp, era pra hoje?" };

export default async function LoginPage({ searchParams }: PageProps<"/entrar">) {
  const { link } = await searchParams;
  return <LoginForm expiredLink={link === "expirado"} />;
}
