"use client";

import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { deleteDemand, quickCreateDemand } from "@/actions/demandActions";
import { useToast } from "@/contexts/ToastContext";

interface QuickAddProps {
  workdayEnd: string;
}

/** Enter cria a demanda pra hoje, no fim do expediente, prioridade média. */
export function QuickAdd({ workdayEnd }: QuickAddProps) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  function handleChangeQuickInput(e: ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  function handleSubmitQuickForm(e: FormEvent) {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    startTransition(async () => {
      const result = await quickCreateDemand(text);
      if (!result.ok) return toast(result.error);
      setTitle("");
      toast(`anotado pra hoje, ${workdayEnd}.`, () => void deleteDemand(result.id));
    });
  }

  return (
    <form onSubmit={handleSubmitQuickForm} className="border-divider flex items-center gap-2.5 border-b">
      <input
        aria-label="anotação rápida"
        value={title}
        onChange={handleChangeQuickInput}
        placeholder="anota aí o que acabaram de pedir"
        className="text-text h-[52px] min-w-0 flex-1 border-none bg-transparent text-[17px] outline-none"
      />
      <button type="submit" disabled={pending} className="btn btn-ghost text-sm whitespace-nowrap">
        anotar ↵
      </button>
    </form>
  );
}
