"use client";

import type { KeyboardEvent } from "react";
import { CaretLeftIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { STATUSES, STATUS_LABEL, type Status } from "@/lib/constants";
import { plusOneDay } from "@/lib/dates";
import { describeWhen, type DemandDTO, type ProjectDTO } from "@/lib/demand";
import { Chip } from "@/components/Chip";
import { TONE_TIME } from "@/components/DemandRow";
import { useNow } from "@/contexts/NowContext";
import { DetailFields } from "./DetailFields";
import { useDemandDraft } from "./useDemandDraft";

export interface DemandDetailProps {
  demand: DemandDTO;
  projects: ProjectDTO[];
  onClose: () => void;
}

export function DemandDetail({ demand, projects, onClose }: DemandDetailProps) {
  const { now, tz } = useNow();
  const { draft, registerText, setLocal, setField, flush, actions } = useDemandDraft(demand);
  const when = describeWhen(draft, now, tz);
  const done = draft.status === "done";

  // título é uma linha só: Enter só sai do campo (e salva no blur)
  function handleKeyDownTitleInput(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    e.currentTarget.blur();
  }
  function handleSelectStatus(status: Status) {
    setLocal({ status });
    void actions.setStatus(draft, status);
  }
  function handleClickDeleteButton() {
    flush();
    void actions.remove(draft);
    onClose();
  }
  function handleClickPostponeButton() {
    flush();
    setLocal({ due: plusOneDay(draft.due, tz) });
    void actions.postpone(draft);
  }
  function handleClickDoneButton() {
    flush();
    void actions.toggleDone(draft);
    onClose();
  }

  return (
    <div className="bg-surface flex h-full flex-col">
      <div className="flex items-center px-2.5 pt-[calc(10px+env(safe-area-inset-top))] md:pt-2.5">
        <button onClick={onClose} aria-label="Fechar" className="btn btn-icon size-10 text-lg text-neutral-300">
          <CaretLeftIcon className="md:hidden" />
          <XIcon className="hidden md:block" />
        </button>
        <button
          onClick={handleClickDeleteButton}
          aria-label="Apagar"
          className="btn btn-icon ml-auto size-10 text-lg text-neutral-500"
        >
          <TrashIcon />
        </button>
      </div>
      {/* shrink-0: sem isso o flex espreme o grupo de campos em vez de rolar */}
      <div className="flex flex-1 flex-col gap-[22px] overflow-auto px-6 pt-1 pb-6 [&>*]:shrink-0">
        <div className="flex flex-col gap-1.5">
          <span className={`tabular text-sm font-medium ${TONE_TIME[when.tone]}`}>
            {when.top} · {when.time}
          </span>
          <textarea
            aria-label="título"
            rows={2}
            onKeyDown={handleKeyDownTitleInput}
            className="text-text w-full resize-none border-none bg-transparent p-0 text-[26px] leading-[1.15] font-medium tracking-[-0.03em] outline-none"
            {...registerText("title")}
          />
        </div>
        <div role="group" aria-label="status" className="flex flex-wrap gap-1">
          {STATUSES.map((s) => (
            <StatusChip key={s} status={s} active={draft.status === s} onSelect={handleSelectStatus} />
          ))}
        </div>
        <DetailFields
          draft={draft}
          projects={projects}
          tz={tz}
          onField={setField}
          requesterField={registerText("requester")}
        />
        <textarea
          aria-label="anotações"
          placeholder="anotações…"
          className="text-text min-h-[110px] resize-y border-0 border-t border-solid border-neutral-900 bg-transparent px-0 pt-3.5 pb-0 text-sm leading-normal outline-none"
          {...registerText("notes")}
        />
      </div>
      <div className="flex gap-2 px-6 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))]">
        <button
          onClick={handleClickPostponeButton}
          className="btn btn-secondary min-h-[46px] flex-1 rounded-xl whitespace-nowrap"
        >
          joga pra amanhã
        </button>
        <button
          onClick={handleClickDoneButton}
          className="btn btn-primary min-h-[46px] flex-1 rounded-xl whitespace-nowrap"
        >
          {done ? "reabrir" : "feito ✓"}
        </button>
      </div>
    </div>
  );
}

interface StatusChipProps {
  status: Status;
  active: boolean;
  onSelect: (s: Status) => void;
}

function StatusChip({ status, active, onSelect }: StatusChipProps) {
  function handleClickStatusChip() {
    onSelect(status);
  }
  return (
    <Chip active={active} onClick={handleClickStatusChip} className="min-h-9">
      {STATUS_LABEL[status]}
    </Chip>
  );
}
