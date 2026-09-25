import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export interface CurrentUser {
  id: string;
  email: string;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser> => {
  const session = await auth();
  if (!session?.user?.id) redirect("/entrar");
  return { id: session.user.id, email: session.user.email ?? "" };
});
