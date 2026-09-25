"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { CheckIcon } from "@phosphor-icons/react";
import { PRIO_GLYPH } from "@/lib/constants";
import { demandMeta, describeWhen, type DemandDTO, type ProjectDTO, type WhenTone } from "@/lib/demand";
import { useNow } from "@/contexts/NowContext";
import { useDemandActions } from "@/hooks/useDemandActions";

export const TONE_TOP: Record<WhenTone, string> = {
  done: "text-neutral-600",
  late: "text-late",
  today: "text-accent-300",
  future: "text-neutral-500",
};

export const TONE_TIME: Record<WhenTone, string> = {
  done: "text-neutral-600",
  late: "text-late",
  today: "text-accent",
  future: "text-text",
};

export function bangColor(d: Pick<DemandDTO, "prio">) {
  return d.prio === "media" ? "text-neutral-500" : "text-accent";
}

interface DemandRowProps {
  demand: DemandDTO;
  projects: ProjectDTO[];
  /** Na lista o status vem antes do projeto na meta. */
  withStatus?: boolean;
}

export function DemandRow({ demand, projects, withStatus = false }: DemandRowProps) {
  const { now, tz } = useNow();
  const { toggleDone } = useDemandActions();
  const [, startTransition] = useTransition();
  const [status, setOptimisticStatus] = useOptimistic(demand.status);
  const done = status === "done";
  const when = describeWhen({ due: demand.due, status }, now, tz);

  function handleClickCheckButton() {
    startTransition(async () => {
      setOptimisticStatus(done ? (demand.prevStatus ?? "todo") : "done");
      await toggleDone(demand);
    });
  }

  return (
    <div className="hover:bg-text/5 relative flex items-center gap-3.5 rounded-xl px-3 py-[11px]">
      <button
        type="button"
        onClick={handleClickCheckButton}
        aria-label={done ? `Reabrir ${demand.title}` : `Concluir ${demand.title}`}
        aria-pressed={done}
        className={`text-bg relative z-10 grid size-[22px] flex-none place-items-center rounded-[7px] border-[1.5px] border-neutral-600 p-0 text-xs ${done ? "bg-neutral-600" : "bg-transparent"}`}
      >
        <CheckIcon weight="bold" className={done ? "opacity-100" : "opacity-0"} />
      </button>
      <div className="tabular flex w-[62px] flex-none flex-col leading-[1.2]">
        <span className={`text-[11px] ${TONE_TOP[when.tone]}`}>{when.top}</span>
        <span className={`text-[15px] font-medium ${TONE_TIME[when.tone]}`}>{when.time}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <Link
          href={`/d/${demand.id}`}
          scroll={false}
          className={`truncate text-[15px] no-underline after:absolute after:inset-0 after:rounded-xl hover:text-inherit ${done ? "text-neutral-500 line-through" : "text-text"}`}
        >
          {demand.title}
        </Link>
        <div className="truncate text-xs text-neutral-500">{demandMeta(demand, projects, withStatus)}</div>
      </div>
      {!done && (
        <span className={`flex-none text-[15px] font-semibold tracking-[-0.06em] ${bangColor(demand)}`}>
          {PRIO_GLYPH[demand.prio].glyph}
        </span>
      )}
    </div>
  );
}
