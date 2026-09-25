"use client";

import { useTransition } from "react";
import { markAllNotificationsRead } from "@/actions/notificationActions";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();

  function handleClickMarkAllButton() {
    startTransition(() => void markAllNotificationsRead());
  }

  return (
    <button onClick={handleClickMarkAllButton} disabled={pending} className="btn btn-ghost ml-auto whitespace-nowrap">
      marcar como lido
    </button>
  );
}
