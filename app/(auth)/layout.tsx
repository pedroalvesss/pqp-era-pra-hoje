import type { ReactNode } from "react";
import { connection } from "next/server";
import { Lockup } from "@/components/Logo";
import { ToastProvider } from "@/contexts/ToastContext";
import { getRequestNow } from "@/lib/requestNow";
import { AuthHero } from "./_components/AuthHero";

interface AuthLayoutProps {
  children: ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // a folhinha mostra a data de hoje, então nada de página estática
  await connection();
  return (
    <ToastProvider>
      <div className="flex min-h-dvh">
        <AuthHero now={getRequestNow()} />
        <main className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="flex w-full max-w-[340px] flex-col gap-7">
            <div className="md:hidden">
              <Lockup markSize={44} textSize={17} />
            </div>
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
