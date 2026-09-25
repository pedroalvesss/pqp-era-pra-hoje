"use client";

import type { ChangeEvent } from "react";
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
  const { draft, setDraft, setText, setField, flush, actions } = useDemandDraft(demand);
  const when = describeWhen(draft, now, tz);
  const done = draft.status === "done";

  function handleChangeTitleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setText("title", e.target.value.replace(/\n/g, " "));
  }
  function handleChangeNotesInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setText("notes", e.target.value);
  }
  function handleSelectStatus(status: Status) {
    setDraft((d) => ({ ...d, status }));
    void actions.setStatus(draft, status);
  }
  function handleClickDeleteButton() {
    flush();
    void actions.remove(draft);
    onClose();
  }
  function handleClickPostponeButton() {
    flush();
    setDraft((d) => ({ ...d, due: plusOneDay(d.due, tz) }));
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
      <div className="flex flex-1 flex-col gap-[22px] overflow-auto px-6 pt-1 pb-6">
        <div className="flex flex-col gap-1.5">
          <span className={`tabular text-sm font-medium ${TONE_TIME[when.tone]}`}>
            {when.top} · {when.time}
          </span>
          <textarea
            aria-label="título"
            value={draft.title}
            onChange={handleChangeTitleInput}
            onBlur={flush}
            rows={2}
            className="text-text w-full resize-none border-none bg-transparent p-0 text-[26px] leading-[1.15] font-medium tracking-[-0.03em] outline-none"
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
          onText={setText}
          onBlurText={flush}
        />
        <textarea
          aria-label="anotações"
          value={draft.notes}
          onChange={handleChangeNotesInput}
          onBlur={flush}
          placeholder="anotações…"
          className="text-text min-h-[110px] resize-y border-0 border-t border-solid border-neutral-900 bg-transparent px-0 pt-3.5 pb-0 text-sm leading-normal outline-none"
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
