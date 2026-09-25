"use client";

import type { ChangeEvent } from "react";
import { COMPANIES, DEPTS, type Company, type Dept, type Prio } from "@/lib/constants";
import { isoDate, hm, withDate, withTime } from "@/lib/dates";
import type { DemandDTO, ProjectDTO } from "@/lib/demand";
import type { UpdateDemandInput } from "@/lib/schemas";
import { OptionalChips, ProjectChips } from "@/components/DemandChips";
import { FormGroup, FormRow, rowInputClass } from "@/components/FormGroup";
import { PrioPicker } from "@/components/PrioPicker";

interface DetailFieldsProps {
  draft: DemandDTO;
  projects: ProjectDTO[];
  tz: string;
  onField: (patch: UpdateDemandInput) => void;
  onText: (field: "requester", value: string) => void;
  onBlurText: () => void;
}

export function DetailFields({ draft, projects, tz, onField, onText, onBlurText }: DetailFieldsProps) {
  function handleChangeDateInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value) onField({ due: withDate(draft.due, e.target.value, tz) });
  }
  function handleChangeTimeInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value) onField({ due: withTime(draft.due, e.target.value, tz) });
  }
  function handleChangeRequesterInput(e: ChangeEvent<HTMLInputElement>) {
    onText("requester", e.target.value);
  }
  function handleChangePrio(prio: Prio) {
    onField({ prio });
  }
  function handleChangeProject(projectId: string | null) {
    onField({ projectId });
  }
  function handleChangeCompany(company: Company | null) {
    onField({ company });
  }
  function handleChangeDept(dept: Dept | null) {
    onField({ dept });
  }

  return (
    <FormGroup hairline="bg">
      <FormRow label="prazo" htmlFor="dd-date">
        <input
          id="dd-date"
          type="date"
          value={isoDate(draft.due, tz)}
          onChange={handleChangeDateInput}
          className={rowInputClass}
        />
        <input
          aria-label="hora"
          type="time"
          value={hm(draft.due, tz)}
          onChange={handleChangeTimeInput}
          className={`${rowInputClass} w-[86px] flex-none`}
        />
      </FormRow>
      <FormRow label="urgência">
        <PrioPicker value={draft.prio} onChange={handleChangePrio} />
      </FormRow>
      <FormRow label="quem pediu" htmlFor="dd-req">
        <input
          id="dd-req"
          value={draft.requester}
          onChange={handleChangeRequesterInput}
          onBlur={onBlurText}
          placeholder="ninguém?"
          className={rowInputClass}
        />
      </FormRow>
      <FormRow label="projeto">
        <ProjectChips projects={projects} value={draft.projectId} onChange={handleChangeProject} />
      </FormRow>
      <FormRow label="empresa">
        <OptionalChips label="empresa" options={COMPANIES} value={draft.company} onChange={handleChangeCompany} />
      </FormRow>
      <FormRow label="departamento">
        <OptionalChips label="departamento" options={DEPTS} value={draft.dept} onChange={handleChangeDept} />
      </FormRow>
    </FormGroup>
  );
}
