"use client";

import { useEffect } from "react";

/** Registra o service worker (instalar como PWA + receber push). */
export function ServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(console.error);
    }
  }, []);
  return null;
}
