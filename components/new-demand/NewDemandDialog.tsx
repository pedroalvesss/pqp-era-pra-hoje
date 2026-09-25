"use client";

import {
  COMPANIES,
  DAY_CHOICES,
  DAY_LABEL,
  DEPTS,
  type Company,
  type DayChoice,
  type DueDay,
  type Dept,
  type Prio,
} from "@/lib/constants";
import type { ProjectDTO } from "@/lib/demand";
import { Chip, ChipScroller } from "@/components/Chip";
import { OptionalChips, ProjectChips } from "@/components/DemandChips";
import { FormGroup, FormRow, rowInputClass } from "@/components/FormGroup";
import { PrioPicker } from "@/components/PrioPicker";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DatePickerChip } from "./DatePickerChip";
import { useNewDemandForm } from "./useNewDemandForm";

export interface NewDemandDialogProps {
  projects: ProjectDTO[];
  workdayEnd: string;
  onClose: () => void;
}

export default function NewDemandDialog({ projects, workdayEnd, onClose }: NewDemandDialogProps) {
  const { form, values, pick, submit, error } = useNewDemandForm(workdayEnd, projects, onClose);
  const { register, formState } = form;

  function handleOpenChangeDialog(open: boolean) {
    if (!open) onClose();
  }
  function handleSelectDay(day: DayChoice) {
    pick("day", day);
  }
  function handleSelectDate(date: string) {
    pick("date", date);
    pick("day", "data");
  }
  function handleChangePrio(p: Prio) {
    pick("prio", p);
  }
  function handleChangeProject(id: string | null) {
    pick("projectId", id);
  }
  function handleChangeCompany(c: Company | null) {
    pick("company", c);
  }
  function handleChangeDept(d: Dept | null) {
    pick("dept", d);
  }

  return (
    <Dialog open onOpenChange={handleOpenChangeDialog}>
      <DialogContent className="animate-rise-in bg-surface md:animate-pop-in inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-[20px] shadow-lg md:top-1/2 md:bottom-auto md:max-h-[90vh] md:-translate-y-1/2 md:rounded-[18px]">
        <DialogTitle>nova demanda</DialogTitle>
        <div aria-hidden="true" className="bg-accent flex h-[18px] flex-none items-center justify-between px-[30%]">
          <span className="bg-surface size-1.5 rounded-full" />
          <span className="bg-surface size-1.5 rounded-full" />
        </div>
        {/* Enter no título envia o form */}
        <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-4 pt-5 pb-2 [&>*]:shrink-0">
            <input
              autoFocus
              aria-label="o que pediram?"
              placeholder="o que pediram?"
              className="text-text min-w-0 border-none bg-transparent px-1 text-[26px] font-medium tracking-[-0.03em] outline-none"
              {...register("title")}
            />
            <FormGroup>
              <FormRow label="quando">
                <DayChips
                  value={values.day}
                  date={values.date}
                  onSelect={handleSelectDay}
                  onSelectDate={handleSelectDate}
                />
              </FormRow>
              <FormRow label="hora" htmlFor="nd-time">
                <input id="nd-time" type="time" className={rowInputClass} {...register("time")} />
              </FormRow>
              <FormRow label="urgência">
                <PrioPicker value={values.prio} onChange={handleChangePrio} />
              </FormRow>
              <FormRow label="quem pediu" htmlFor="nd-req">
                <input id="nd-req" placeholder="ninguém?" className={rowInputClass} {...register("requester")} />
              </FormRow>
              <FormRow label="projeto">
                <ProjectChips projects={projects} value={values.projectId} onChange={handleChangeProject} />
              </FormRow>
              <FormRow label="empresa">
                <OptionalChips
                  label="empresa"
                  options={COMPANIES}
                  value={values.company}
                  onChange={handleChangeCompany}
                />
              </FormRow>
              <FormRow label="departamento">
                <OptionalChips label="departamento" options={DEPTS} value={values.dept} onChange={handleChangeDept} />
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
            <button
              type="submit"
              disabled={formState.isSubmitting}
              className="btn btn-primary min-h-[46px] flex-[2] rounded-xl"
            >
              anotar
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DayChipsProps {
  value: DueDay;
  date: string | null;
  onSelect: (value: DayChoice) => void;
  onSelectDate: (date: string) => void;
}

function DayChips({ value, date, onSelect, onSelectDate }: DayChipsProps) {
  return (
    <ChipScroller label="quando">
      {DAY_CHOICES.map((d) => (
        <DayChip key={d} day={d} active={value === d} onSelect={onSelect} />
      ))}
      <DatePickerChip value={date} active={value === "data"} onSelect={onSelectDate} />
    </ChipScroller>
  );
}

interface DayChipProps {
  day: DayChoice;
  active: boolean;
  onSelect: (value: DayChoice) => void;
}

function DayChip({ day, active, onSelect }: DayChipProps) {
  function handleClickDayChip() {
    onSelect(day);
  }
  return (
    <Chip variant="option" active={active} onClick={handleClickDayChip}>
      {DAY_LABEL[day]}
    </Chip>
  );
}
