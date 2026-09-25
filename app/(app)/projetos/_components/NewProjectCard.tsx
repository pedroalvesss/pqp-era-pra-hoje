"use client";

import { useState, useTransition, type ChangeEvent, type KeyboardEvent } from "react";
import { createProject } from "@/actions/projectActions";
import { useToast } from "@/contexts/ToastContext";

/** Card tracejado que vira input. Enter cria, Esc cancela. */
export function NewProjectCard() {
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function handleClickAddButton() {
    setAdding(true);
  }
  function handleChangeNameInput(e: ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
  }
  function handleKeyDownNameInput(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.stopPropagation();
      setAdding(false);
      setName("");
    }
    if (e.key === "Enter" && name.trim() && !pending) {
      startTransition(async () => {
        const result = await createProject(name);
        if (!result.ok) return toast(result.error);
        setAdding(false);
        setName("");
      });
    }
  }

  return (
    <div className="flex min-h-[150px] flex-col justify-center rounded-2xl border-[1.5px] border-dashed border-neutral-800 p-4">
      {adding ? (
        <input
          autoFocus
          aria-label="nome do projeto"
          value={name}
          disabled={pending}
          onChange={handleChangeNameInput}
          onKeyDown={handleKeyDownNameInput}
          placeholder="nome + enter"
          className="input"
        />
      ) : (
        <button onClick={handleClickAddButton} className="btn btn-ghost self-start text-sm">
          + novo projeto
        </button>
      )}
    </div>
  );
}
