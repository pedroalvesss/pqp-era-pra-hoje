import { redirect } from "next/navigation";
import { ResetPasswordForm } from "./_components/ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/redefinir-senha">) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) redirect("/entrar?link=expirado");
  return <ResetPasswordForm token={token} />;
}
