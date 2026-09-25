"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface NowValue {
  now: number;
  tz: string;
}

const NowContext = createContext<NowValue>({ now: 0, tz: "America/Sao_Paulo" });

interface NowProviderProps {
  initialNow: number;
  tz: string;
  children: ReactNode;
}

/** Relógio compartilhado: começa com o "agora" do servidor (sem erro de hidratação) e anda a cada 30s. */
export function NowProvider({ initialNow, tz, children }: NowProviderProps) {
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  return <NowContext value={{ now, tz }}>{children}</NowContext>;
}

export function useNow() {
  return useContext(NowContext);
}
