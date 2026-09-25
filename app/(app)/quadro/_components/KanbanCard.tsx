"use client";

import Link from "next/link";
import type { DragEvent } from "react";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { PRIO_GLYPH } from "@/lib/constants";
import { demandMeta, describeWhen, type DemandDTO, type ProjectDTO } from "@/lib/demand";
import { TONE_TIME, bangColor } from "@/components/DemandRow";
import { useNow } from "@/contexts/NowContext";

interface KanbanCardProps {
  demand: DemandDTO;
  projects: ProjectDTO[];
  onAdvance: (d: DemandDTO) => void;
}

export function KanbanCard({ demand, projects, onAdvance }: KanbanCardProps) {
  const { now, tz } = useNow();
  const when = describeWhen(demand, now, tz);
  const done = demand.status === "done";

  function handleDragStartCard(e: DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData("text/plain", demand.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleClickAdvanceButton() {
    onAdvance(demand);
  }

  return (
    <div
      draggable
      onDragStart={handleDragStartCard}
      className="bg-surface relative flex cursor-grab flex-col gap-2 rounded-xl px-3 pt-3 pb-2.5 hover:shadow-sm"
    >
      <div className="tabular flex items-baseline gap-2 text-xs">
        <span className={`font-medium ${TONE_TIME[when.tone]}`}>
          {when.top} · {when.time}
        </span>
        {!done && (
          <span className={`ml-auto text-sm font-semibold tracking-[-0.06em] ${bangColor(demand)}`}>
            {PRIO_GLYPH[demand.prio].glyph}
          </span>
        )}
      </div>
      <Link
        href={`/d/${demand.id}`}
        scroll={false}
        draggable={false}
        className={`text-sm leading-[1.35] no-underline after:absolute after:inset-0 after:rounded-xl ${done ? "text-neutral-500 line-through hover:text-neutral-500" : "text-text hover:text-text"}`}
      >
        {demand.title}
      </Link>
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <span className="min-w-0 flex-1 truncate">{demandMeta(demand, projects)}</span>
        {!done && (
          <button
            type="button"
            onClick={handleClickAdvanceButton}
            aria-label={`Avançar ${demand.title}`}
            className="hover:bg-accent/14 hover:text-accent relative z-10 grid size-7 flex-none place-items-center rounded-lg border-none bg-transparent p-0 text-neutral-400"
          >
            <ArrowRightIcon />
          </button>
        )}
      </div>
    </div>
  );
}
