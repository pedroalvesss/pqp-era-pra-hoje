"use client";

import { DemandSection } from "@/components/DemandSection";
import { PageTitle } from "@/components/PageTitle";
import { useNow } from "@/contexts/NowContext";
import { greeting } from "@/lib/dates";
import { groupForHome, heroLine, type DemandDTO, type ProjectDTO } from "@/lib/demand";
import { CalendarLeaf } from "./CalendarLeaf";
import { QuickAdd } from "./QuickAdd";

interface HomeViewProps {
  demands: DemandDTO[];
  projects: ProjectDTO[];
  userName: string;
  workdayEnd: string;
}

// agrupa no client pra "hoje" virar "já era" sozinho quando o prazo passa
export function HomeView({ demands, projects, userName, workdayEnd }: HomeViewProps) {
  const { now, tz } = useNow();
  const { late, today, upcoming, todayDone } = groupForHome(demands, now, tz);

  return (
    <>
      <div className="flex flex-col items-stretch gap-5 md:flex-row md:items-end md:gap-9">
        <CalendarLeaf now={now} tz={tz} today={today.length} late={late.length} done={todayDone} />
        <div className="flex w-full min-w-0 flex-1 flex-col gap-[18px]">
          <div className="flex flex-col gap-1.5">
            <span className="text-[15px] text-neutral-400">
              {greeting(now, tz)}, {userName.toLowerCase()}.
            </span>
            <PageTitle>{heroLine(today.length, late.length)}</PageTitle>
          </div>
          <QuickAdd workdayEnd={workdayEnd} />
        </div>
      </div>

      {late.length > 0 && (
        <DemandSection title="já era" titleClassName="text-late" demands={late} projects={projects} />
      )}
      <DemandSection
        title="hoje"
        titleClassName="text-accent"
        demands={today}
        projects={projects}
        empty={<p className="m-0 px-3 py-2 text-[15px] text-neutral-400">relaxa, hoje tá tranquilo.</p>}
      />
      {upcoming.length > 0 && <DemandSection title="depois" demands={upcoming} projects={projects} />}
    </>
  );
}
