import type { ReactNode } from "react";
import { MobileTopBar } from "@/components/shell/MobileTopBar";
import { Sidebar } from "@/components/shell/Sidebar";
import { TabBar } from "@/components/shell/TabBar";
import { ServiceWorker } from "@/components/ServiceWorker";
import { NewDemandProvider } from "@/contexts/NewDemandContext";
import { NowProvider } from "@/contexts/NowContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { getUnreadNotificationsCount } from "@/services/avisosService/getUnreadNotificationsCount";
import { getProfile } from "@/services/perfisService/getProfile";
import { getProjects } from "@/services/projetosService/getProjects";
import { getRequestNow } from "@/lib/requestNow";

interface AppLayoutProps {
  children: ReactNode;
  modal: ReactNode;
}

export default async function AppLayout({ children, modal }: AppLayoutProps) {
  const [profile, projects, unread] = await Promise.all([getProfile(), getProjects(), getUnreadNotificationsCount()]);

  return (
    <NowProvider initialNow={getRequestNow()} tz={profile.timezone}>
      <ToastProvider raised>
        <NewDemandProvider projects={projects} workdayEnd={profile.workdayEnd}>
          <div className="flex h-dvh">
            <Sidebar userName={profile.name} unread={unread} />
            <div className="flex h-full min-w-0 flex-1 flex-col">
              <MobileTopBar userName={profile.name} unread={unread} />
              <main className="flex-1 overflow-auto">
                <div className="flex max-w-[880px] flex-col gap-8 px-3 pt-3.5 pb-8 md:px-12 md:pt-11 md:pb-14">
                  {children}
                </div>
              </main>
              <TabBar />
            </div>
          </div>
          {modal}
          <ServiceWorker />
        </NewDemandProvider>
      </ToastProvider>
    </NowProvider>
  );
}
