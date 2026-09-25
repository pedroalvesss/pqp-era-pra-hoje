"use client";

import { useEffect, useState, useTransition } from "react";
import { subscribePush, unsubscribePush, updatePrefs } from "@/actions/profileActions";
import { useToast } from "@/contexts/ToastContext";

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

function pushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

async function subscribeThisDevice(reg: ServiceWorkerRegistration) {
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
  });
  return subscribePush(sub.toJSON());
}

/**
 * Liga/desliga o push: preferência no banco + assinatura deste aparelho.
 * O switch reflete o aparelho, não só o banco: "ligado" sem assinatura aqui não recebe nada.
 */
export function usePushToggle(enabledInProfile: boolean) {
  const toast = useToast();
  // null = ainda conferindo o aparelho; conta como desligado até provar o contrário
  const [deviceOn, setDeviceOn] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!pushSupported()) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      if (await reg.pushManager.getSubscription()) return setDeviceOn(enabledInProfile);
      // perfil ligado e permissão já dada (ex.: outro login no mesmo aparelho): assina calado
      if (enabledInProfile && Notification.permission === "granted") {
        const result = await subscribeThisDevice(reg);
        return setDeviceOn(result.ok);
      }
      setDeviceOn(false);
    });
  }, [enabledInProfile]);

  async function turnOn() {
    if (!pushSupported()) return toast("no iphone, instala o app na tela de início pra ter push.");
    if ((await Notification.requestPermission()) !== "granted") return toast("sem permissão, sem push.");
    try {
      const result = await subscribeThisDevice(await navigator.serviceWorker.ready);
      if (!result.ok) return toast(result.error);
    } catch {
      return toast("o navegador não quis assinar o push. tenta de novo?");
    }
    setDeviceOn(true);
    await updatePrefs({ pushEnabled: true });
  }

  async function turnOff() {
    setDeviceOn(false);
    if (pushSupported()) {
      const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
    }
    await updatePrefs({ pushEnabled: false });
  }

  const enabled = deviceOn ?? false;

  function toggle() {
    startTransition(() => (enabled ? turnOff() : turnOn()));
  }

  return { enabled, pending, toggle };
}
