"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markNotificationRead } from "@/actions/notificationActions";
import { useNow } from "@/contexts/NowContext";
import { relativeAgo } from "@/lib/dates";
import type { NotificationDTO } from "@/services/avisosService/getNotifications";

interface NotificationItemProps {
  notification: NotificationDTO;
}

/** Clicar marca como lido e abre a demanda. */
export function NotificationItem({ notification: n }: NotificationItemProps) {
  const router = useRouter();
  const { now, tz } = useNow();
  const [, startTransition] = useTransition();

  function handleClickNotification() {
    if (n.demandId) router.push(`/d/${n.demandId}`, { scroll: false });
    if (n.unread) startTransition(() => void markNotificationRead(n.id));
  }

  return (
    <button
      onClick={handleClickNotification}
      className="hover:bg-text/5 flex items-baseline gap-3.5 rounded-xl border-none bg-transparent p-3 text-left text-inherit"
    >
      <span
        aria-label={n.unread ? "não lido" : undefined}
        className={`bg-accent size-2 flex-none -translate-y-0.5 rounded-full ${n.unread ? "opacity-100" : "opacity-0"}`}
      />
      <span
        className={`min-w-0 flex-1 text-[15px] leading-[1.45] text-pretty ${n.unread ? "text-text" : "text-neutral-400"}`}
      >
        {n.text}
      </span>
      <span className="tabular flex-none text-xs text-neutral-500">{relativeAgo(n.createdAt, now, tz)}</span>
    </button>
  );
}
