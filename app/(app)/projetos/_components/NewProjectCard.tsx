"use client";

import { useState, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProject } from "@/actions/projectActions";
import { useToast } from "@/contexts/ToastContext";
import { projectSchema } from "@/lib/schemas";

interface NewProjectValues {
  name: string;
}

/** Card tracejado que vira input. Enter cria, Esc cancela. */
export function NewProjectCard() {
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<NewProjectValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "" },
  });

  function handleClickAddButton() {
    setAdding(true);
  }
  function handleKeyDownNameInput(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Escape") return;
    e.stopPropagation();
    setAdding(false);
    reset();
  }
  async function handleSubmitProjectForm({ name }: NewProjectValues) {
    const result = await createProject(name);
    if (!result.ok) return toast(result.error);
    setAdding(false);
    reset();
  }

  return (
    <div className="flex min-h-[150px] flex-col justify-center rounded-2xl border-[1.5px] border-dashed border-neutral-800 p-4">
      {adding ? (
        <form noValidate onSubmit={handleSubmit(handleSubmitProjectForm)}>
          <input
            autoFocus
            aria-label="nome do projeto"
            disabled={formState.isSubmitting}
            onKeyDown={handleKeyDownNameInput}
            placeholder="nome + enter"
            className="input"
            {...register("name")}
          />
        </form>
      ) : (
        <button onClick={handleClickAddButton} className="btn btn-ghost self-start text-sm">
          + novo projeto
        </button>
      )}
    </div>
  );
}
