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

/** Liga/desliga o push: preferência no banco + assinatura deste aparelho. */
export function usePushToggle(enabledInProfile: boolean) {
  const toast = useToast();
  const [enabled, setEnabled] = useState(enabledInProfile);
  const [pending, startTransition] = useTransition();

  // preferência ligada, permissão já dada e este aparelho ainda sem assinatura: assina calado
  useEffect(() => {
    if (!enabledInProfile || !pushSupported() || Notification.permission !== "granted") return;
    navigator.serviceWorker.ready.then(async (reg) => {
      if (!(await reg.pushManager.getSubscription())) await subscribeThisDevice(reg);
    });
  }, [enabledInProfile]);

  async function subscribeThisDevice(reg: ServiceWorkerRegistration) {
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
    return subscribePush(sub.toJSON());
  }

  async function turnOn() {
    if (!pushSupported()) return toast("no iphone, instala o app na tela de início pra ter push.");
    if ((await Notification.requestPermission()) !== "granted") return toast("sem permissão, sem push.");
    const result = await subscribeThisDevice(await navigator.serviceWorker.ready);
    if (!result.ok) return toast(result.error);
    setEnabled(true);
    await updatePrefs({ pushEnabled: true });
  }

  async function turnOff() {
    setEnabled(false);
    if (pushSupported()) {
      const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
    }
    await updatePrefs({ pushEnabled: false });
  }

  function toggle() {
    startTransition(() => (enabled ? turnOff() : turnOn()));
  }

  return { enabled, pending, toggle };
}
