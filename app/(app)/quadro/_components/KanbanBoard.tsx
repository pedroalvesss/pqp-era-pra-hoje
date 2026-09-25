"use client";

import { useOptimistic, useTransition } from "react";
import type { Status } from "@/lib/constants";
import { nextStatus, sortDemands, type DemandDTO, type ProjectDTO } from "@/lib/demand";
import { useDemandActions } from "@/hooks/useDemandActions";
import { EmptyBoard } from "./EmptyBoard";
import { KanbanColumn } from "./KanbanColumn";

const COLUMNS: { status: Status; label: string; className: string }[] = [
  { status: "todo", label: "a fazer", className: "text-text" },
  { status: "doing", label: "fazendo", className: "text-accent" },
  { status: "waiting", label: "esperando alguém", className: "text-neutral-300" },
  { status: "done", label: "feito", className: "text-neutral-500" },
];

interface KanbanBoardProps {
  demands: DemandDTO[];
  projects: ProjectDTO[];
}

interface Move {
  id: string;
  status: Status;
}

function applyMove(list: DemandDTO[], move: Move) {
  return list.map((d) => (d.id === move.id ? { ...d, status: move.status } : d));
}

export function KanbanBoard({ demands, projects }: KanbanBoardProps) {
  const { setStatus } = useDemandActions();
  const [, startTransition] = useTransition();
  const [board, moveOptimistic] = useOptimistic(demands, applyMove);
  const sorted = sortDemands(board);

  function move(d: DemandDTO, status: Status) {
    if (d.status === status) return;
    startTransition(async () => {
      moveOptimistic({ id: d.id, status });
      await setStatus(d, status);
    });
  }

  function handleDropDemand(id: string, status: Status) {
    const d = board.find((x) => x.id === id);
    if (d) move(d, status);
  }

  function handleAdvance(d: DemandDTO) {
    move(d, nextStatus(d.status));
  }

  if (board.length === 0) return <EmptyBoard />;

  return (
    <div className="-mx-1 -mt-2 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-1 pb-3">
      {COLUMNS.map((c) => (
        <KanbanColumn
          key={c.status}
          status={c.status}
          label={c.label}
          labelClassName={c.className}
          demands={sorted.filter((d) => d.status === c.status)}
          projects={projects}
          onDropDemand={handleDropDemand}
          onAdvance={handleAdvance}
        />
      ))}
    </div>
  );
}
