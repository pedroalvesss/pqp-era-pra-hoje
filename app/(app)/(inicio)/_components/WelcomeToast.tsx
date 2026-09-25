"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

/** Depois do cadastro o servidor manda pra "/?novo=1". */
export function WelcomeToast() {
  const toast = useToast();
  const router = useRouter();
  useEffect(() => {
    toast("conta criada. adeus, caderninho.");
    router.replace("/");
  }, [toast, router]);
  return null;
}
