"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { DemandDTO } from "@/lib/demand";
import type { UpdateDemandInput } from "@/lib/schemas";
import { useDemandActions } from "@/hooks/useDemandActions";

type TextField = "title" | "notes" | "requester";
const TEXT_DELAY = 700;

/** O form guarda a cópia local da demanda: chips salvam na hora, texto salva com debounce (e no blur). */
export function useDemandDraft(demand: DemandDTO) {
  const actions = useDemandActions();
  const form = useForm<DemandDTO>({ defaultValues: demand });
  const draft = useWatch({ control: form.control }) as DemandDTO;
  const dirtyText = useRef(new Set<TextField>());
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function flush() {
    clearTimeout(timer.current);
    const patch: UpdateDemandInput = {};
    for (const field of dirtyText.current) patch[field] = form.getValues(field);
    dirtyText.current.clear();
    if (patch.title !== undefined && !patch.title.trim()) delete patch.title;
    if (Object.keys(patch).length) void actions.save(demand.id, patch);
  }

  // não perde o que foi digitado se o drawer fechar antes do debounce
  useEffect(() => () => flush(), []); // eslint-disable-line react-hooks/exhaustive-deps

  function registerText<F extends TextField>(field: F) {
    return form.register(field, {
      onChange: () => {
        dirtyText.current.add(field);
        clearTimeout(timer.current);
        timer.current = setTimeout(flush, TEXT_DELAY);
      },
      onBlur: flush,
    });
  }

  /** Só atualiza a tela; quem chama já salvou (status, adiar). */
  function setLocal(patch: Partial<DemandDTO>) {
    for (const [key, value] of Object.entries(patch)) form.setValue(key as keyof DemandDTO, value as never);
  }

  function setField(patch: UpdateDemandInput) {
    setLocal(patch);
    void actions.save(demand.id, patch);
  }

  return { draft, registerText, setLocal, setField, flush, actions };
}
