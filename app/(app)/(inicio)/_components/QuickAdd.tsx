"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteDemand, quickCreateDemand } from "@/actions/demandActions";
import { useToast } from "@/contexts/ToastContext";
import { quickDemandSchema } from "@/lib/schemas";

interface QuickAddProps {
  workdayEnd: string;
}

interface QuickAddValues {
  title: string;
}

/** Enter cria a demanda pra hoje, no fim do expediente, prioridade média. Vazio não faz nada. */
export function QuickAdd({ workdayEnd }: QuickAddProps) {
  const toast = useToast();
  const { register, handleSubmit, reset, formState } = useForm<QuickAddValues>({
    resolver: zodResolver(quickDemandSchema),
    defaultValues: { title: "" },
  });

  async function handleSubmitQuickForm({ title }: QuickAddValues) {
    const result = await quickCreateDemand(title);
    if (!result.ok) return toast(result.error);
    reset();
    toast(`anotado pra hoje, ${workdayEnd}.`, () => void deleteDemand(result.id));
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(handleSubmitQuickForm)}
      className="border-divider flex items-center gap-2.5 border-b"
    >
      <input
        aria-label="anotação rápida"
        placeholder="anota aí o que acabaram de pedir"
        className="text-text h-[52px] min-w-0 flex-1 border-none bg-transparent text-[17px] outline-none"
        {...register("title")}
      />
      <button type="submit" disabled={formState.isSubmitting} className="btn btn-ghost text-sm whitespace-nowrap">
        anotar ↵
      </button>
    </form>
  );
}
