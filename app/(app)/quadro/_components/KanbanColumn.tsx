"use client";

import { useState, type DragEvent } from "react";
import type { Status } from "@/lib/constants";
import type { DemandDTO, ProjectDTO } from "@/lib/demand";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  status: Status;
  label: string;
  labelClassName: string;
  demands: DemandDTO[];
  projects: ProjectDTO[];
  onDropDemand: (id: string, status: Status) => void;
  onAdvance: (d: DemandDTO) => void;
}

export function KanbanColumn({
  status,
  label,
  labelClassName,
  demands,
  projects,
  onDropDemand,
  onAdvance,
}: KanbanColumnProps) {
  const [over, setOver] = useState(false);

  function handleDragOverColumn(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    if (!over) setOver(true);
  }
  function handleDragLeaveColumn() {
    setOver(false);
  }
  function handleDropColumn(e: DragEvent<HTMLElement>) {
    e.preventDefault();
    setOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDropDemand(id, status);
  }

  return (
    <section
      aria-label={label}
      onDragOver={handleDragOverColumn}
      onDragLeave={handleDragLeaveColumn}
      onDrop={handleDropColumn}
      className={`flex min-h-[360px] flex-[0_0_84%] snap-start flex-col gap-2 rounded-2xl p-1.5 outline-[1.5px] -outline-offset-1 outline-dashed md:flex-[1_0_200px] ${over ? "bg-accent/8 outline-accent" : "outline-transparent"}`}
    >
      <div className="flex items-baseline gap-1.5 px-1.5 pt-1 pb-1.5">
        <h2 className={`text-[17px] font-medium tracking-[-0.02em] ${labelClassName}`}>{label}</h2>
        <span className="tabular text-xs text-neutral-500">{demands.length}</span>
      </div>
      {demands.map((d) => (
        <KanbanCard key={d.id} demand={d} projects={projects} onAdvance={onAdvance} />
      ))}
    </section>
  );
}
