"use client";

import { useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { updatePrefs } from "@/actions/profileActions";
import { chipClass } from "@/components/Chip";
import { LEADS, LEAD_LABEL, type Lead } from "@/lib/constants";
import type { PrefsInput } from "@/lib/schemas";
import { useToast } from "@/contexts/ToastContext";
import { usePushToggle } from "../_hooks/usePushToggle";
import { Switch } from "./Switch";

interface PrefsGroupProps {
  pushEnabled: boolean;
  lead: Lead;
  workdayEnd: string;
}

const row = "flex items-center gap-3 px-4 [&+&]:shadow-[inset_0_1px_0_var(--color-neutral-900)]";

export function PrefsGroup({ pushEnabled, lead, workdayEnd }: PrefsGroupProps) {
  const toast = useToast();
  const push = usePushToggle(pushEnabled);
  const [, startTransition] = useTransition();
  // cada mudança salva na hora; o form só guarda o valor atual
  const { register, setValue, control } = useForm({ defaultValues: { lead, workdayEnd } });
  const leadValue = useWatch({ control, name: "lead" });

  function save(patch: PrefsInput) {
    startTransition(async () => {
      const result = await updatePrefs(patch);
      if (!result.ok) toast(result.error);
    });
  }

  function handleSelectLead(l: Lead) {
    setValue("lead", l);
    save({ lead: l });
  }

  function handleChangeEndInput(e: { target: { value: string } }) {
    if (e.target.value) save({ workdayEnd: e.target.value });
  }

  return (
    <div className="bg-surface flex max-w-[560px] flex-col rounded-2xl">
      <div className={`${row} py-3.5`}>
        <span className="flex-1 text-[15px]">notificação push</span>
        <Switch checked={push.enabled} disabled={push.pending} label="notificação push" onToggle={push.toggle} />
      </div>
      <div className={`${row} flex-wrap py-3.5`}>
        <span className="min-w-[120px] flex-1 text-[15px]">avisar antes</span>
        <div role="radiogroup" aria-label="avisar antes" className="flex gap-1">
          {LEADS.map((l) => (
            <LeadOption key={l} lead={l} active={leadValue === l} onSelect={handleSelectLead} />
          ))}
        </div>
      </div>
      <div className={`${row} py-2.5`}>
        <label htmlFor="workday-end" className="flex-1 text-[15px]">
          fim do expediente
        </label>
        <input
          id="workday-end"
          type="time"
          className="tabular text-text border-none bg-transparent text-[15px]"
          {...register("workdayEnd", { onChange: handleChangeEndInput })}
        />
      </div>
    </div>
  );
}

interface LeadOptionProps {
  lead: Lead;
  active: boolean;
  onSelect: (l: Lead) => void;
}

function LeadOption({ lead, active, onSelect }: LeadOptionProps) {
  function handleClickLeadOption() {
    onSelect(lead);
  }
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={handleClickLeadOption}
      className={`${chipClass(active)} min-h-8 rounded-[9px] px-2.5 text-[13px]`}
    >
      {LEAD_LABEL[lead]}
    </button>
  );
}
