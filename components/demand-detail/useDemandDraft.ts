"use client";

import { useEffect, useRef, useState } from "react";
import type { DemandDTO } from "@/lib/demand";
import type { UpdateDemandInput } from "@/lib/schemas";
import { useDemandActions } from "@/hooks/useDemandActions";

type TextField = "title" | "notes" | "requester";
const TEXT_DELAY = 700;

/** Cópia local da demanda: chips salvam na hora, texto salva com debounce (e no blur). */
export function useDemandDraft(demand: DemandDTO) {
  const actions = useDemandActions();
  const [draft, setDraft] = useState(demand);
  const pendingText = useRef<Partial<Record<TextField, string>>>({});
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function flush() {
    clearTimeout(timer.current);
    const patch = pendingText.current;
    pendingText.current = {};
    if (patch.title !== undefined && !patch.title.trim()) delete patch.title;
    if (Object.keys(patch).length) void actions.save(demand.id, patch);
  }

  // não perde o que foi digitado se o drawer fechar antes do debounce
  useEffect(() => () => flush(), []); // eslint-disable-line react-hooks/exhaustive-deps

  function setText(field: TextField, value: string) {
    setDraft((d) => ({ ...d, [field]: value }));
    pendingText.current[field] = value;
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, TEXT_DELAY);
  }

  function setField(patch: UpdateDemandInput) {
    setDraft((d) => ({ ...d, ...patch }));
    void actions.save(demand.id, patch);
  }

  return { draft, setDraft, setText, setField, flush, actions };
}
