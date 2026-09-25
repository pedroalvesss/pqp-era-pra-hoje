"use client";

import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import {
  COMPANIES,
  DAY_CHOICES,
  DAY_LABEL,
  DEPTS,
  type Company,
  type DayChoice,
  type Dept,
  type Prio,
} from "@/lib/constants";
import type { ProjectDTO } from "@/lib/demand";
import { Chip, ChipScroller } from "@/components/Chip";
import { OptionalChips, ProjectChips } from "@/components/DemandChips";
import { FormGroup, FormRow, rowInputClass } from "@/components/FormGroup";
import { PrioPicker } from "@/components/PrioPicker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useNewDemandForm } from "./useNewDemandForm";

export interface NewDemandDialogProps {
  projects: ProjectDTO[];
  workdayEnd: string;
  onClose: () => void;
}

export default function NewDemandDialog({ projects, workdayEnd, onClose }: NewDemandDialogProps) {
  const { form, set, error, pending, submit } = useNewDemandForm(workdayEnd, projects, onClose);

  function handleOpenChangeDialog(open: boolean) {
    if (!open) onClose();
  }
  function handleSubmitForm(e: FormEvent) {
    e.preventDefault();
    submit();
  }
  function handleKeyDownTitleInput(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmitForm(e);
  }
  function handleChangeTitleInput(e: ChangeEvent<HTMLInputElement>) {
    set("title", e.target.value);
  }
  function handleChangeTimeInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value) set("time", e.target.value);
  }
  function handleChangeRequesterInput(e: ChangeEvent<HTMLInputElement>) {
    set("requester", e.target.value);
  }
  function handleChangePrio(p: Prio) {
    set("prio", p);
  }
  function handleChangeProject(id: string | null) {
    set("projectId", id);
  }
  function handleChangeCompany(c: Company | null) {
    set("company", c);
  }
  function handleChangeDept(d: Dept | null) {
    set("dept", d);
  }

  return (
    <Dialog open onOpenChange={handleOpenChangeDialog}>
      <DialogContent className="animate-rise-in bg-surface md:animate-pop-in inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-[20px] shadow-lg md:top-1/2 md:bottom-auto md:max-h-[90vh] md:-translate-y-1/2 md:rounded-[18px]">
        <DialogTitle>nova demanda</DialogTitle>
        <div aria-hidden="true" className="bg-accent flex h-[18px] flex-none items-center justify-between px-[30%]">
          <span className="bg-surface size-1.5 rounded-full" />
          <span className="bg-surface size-1.5 rounded-full" />
        </div>
        <form onSubmit={handleSubmitForm} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 pt-5 pb-2">
            <input
              autoFocus
              aria-label="o que pediram?"
              value={form.title}
              onChange={handleChangeTitleInput}
              onKeyDown={handleKeyDownTitleInput}
              placeholder="o que pediram?"
              className="text-text min-w-0 border-none bg-transparent px-1 text-[26px] font-medium tracking-[-0.03em] outline-none"
            />
            <FormGroup>
              <FormRow label="quando">
                <DayChips value={form.day} onChange={set} />
              </FormRow>
              <FormRow label="hora" htmlFor="nd-time">
                <input
                  id="nd-time"
                  type="time"
                  value={form.time}
                  onChange={handleChangeTimeInput}
                  className={rowInputClass}
                />
              </FormRow>
              <FormRow label="urgência">
                <PrioPicker value={form.prio} onChange={handleChangePrio} />
              </FormRow>
              <FormRow label="quem pediu" htmlFor="nd-req">
                <input
                  id="nd-req"
                  value={form.requester}
                  onChange={handleChangeRequesterInput}
                  placeholder="ninguém?"
                  className={rowInputClass}
                />
              </FormRow>
              <FormRow label="projeto">
                <ProjectChips projects={projects} value={form.projectId} onChange={handleChangeProject} />
              </FormRow>
              <FormRow label="empresa">
                <OptionalChips
                  label="empresa"
                  options={COMPANIES}
                  value={form.company}
                  onChange={handleChangeCompany}
                />
              </FormRow>
              <FormRow label="departamento">
                <OptionalChips label="departamento" options={DEPTS} value={form.dept} onChange={handleChangeDept} />
              </FormRow>
            </FormGroup>
            {error && (
              <p role="alert" className="text-late m-0 px-1 text-[13px]">
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-none gap-2 px-4 pt-3 pb-[calc(28px+env(safe-area-inset-bottom))] md:pb-5">
            <button type="button" onClick={onClose} className="btn btn-secondary min-h-[46px] flex-1 rounded-xl">
              cancelar
            </button>
            <button type="submit" disabled={pending} className="btn btn-primary min-h-[46px] flex-[2] rounded-xl">
              anotar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DayChipsProps {
  value: DayChoice;
  onChange: (key: "day", value: DayChoice) => void;
}

function DayChips({ value, onChange }: DayChipsProps) {
  return (
    <ChipScroller label="quando">
      {DAY_CHOICES.map((d) => (
        <DayChip key={d} day={d} active={value === d} onSelect={onChange} />
      ))}
    </ChipScroller>
  );
}

interface DayChipProps {
  day: DayChoice;
  active: boolean;
  onSelect: (key: "day", value: DayChoice) => void;
}

function DayChip({ day, active, onSelect }: DayChipProps) {
  function handleClickDayChip() {
    onSelect("day", day);
  }
  return (
    <Chip variant="option" active={active} onClick={handleClickDayChip}>
      {DAY_LABEL[day]}
    </Chip>
  );
}
