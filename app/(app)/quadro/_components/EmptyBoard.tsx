"use client";

import { ColumnsIcon } from "@phosphor-icons/react";
import { useNewDemand } from "@/contexts/NewDemandContext";

export function EmptyBoard() {
  const { openNewDemand } = useNewDemand();

  function handleClickNewButton() {
    openNewDemand();
  }

  return (
    <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <ColumnsIcon size={40} className="text-neutral-700" aria-hidden="true" />
      <p className="m-0 max-w-[280px] text-[15px] text-pretty text-neutral-400">
        quadro vazio. ou tá tudo em dia, ou ninguém pediu nada ainda.
      </p>
      <button onClick={handleClickNewButton} className="btn btn-primary min-h-11 rounded-xl px-4">
        + nova demanda
      </button>
    </div>
  );
}
