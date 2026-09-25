import { PageTitle } from "@/components/PageTitle";
import { getNotifications } from "@/services/avisosService/getNotifications";
import { MarkAllReadButton } from "./_components/MarkAllReadButton";
import { NotificationItem } from "./_components/NotificationItem";

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const hasUnread = notifications.some((n) => n.unread);

  return (
    <>
      <div className="flex items-baseline gap-3">
        <PageTitle>avisos</PageTitle>
        {hasUnread && <MarkAllReadButton />}
      </div>
      <div className="-mt-2 flex flex-col">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}
        {notifications.length === 0 && (
          <p className="m-0 px-3 text-[15px] text-neutral-400">nenhum aviso. por enquanto.</p>
        )}
      </div>
    </>
  );
}
