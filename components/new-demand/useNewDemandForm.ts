"use client";

import { useForm, useWatch, type PathValue } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createDemand, deleteDemand } from "@/actions/demandActions";
import type { ProjectDTO } from "@/lib/demand";
import { createDemandSchema, type CreateDemandInput } from "@/lib/schemas";
import { useToast } from "@/contexts/ToastContext";

export function blankForm(workdayEnd: string, projects: ProjectDTO[]): CreateDemandInput {
  return {
    title: "",
    day: "hoje",
    time: workdayEnd,
    prio: "media",
    requester: "",
    projectId: projects[0]?.id ?? null,
    company: null,
    dept: null,
  };
}

export function useNewDemandForm(workdayEnd: string, projects: ProjectDTO[], onDone: () => void) {
  const toast = useToast();
  const form = useForm<CreateDemandInput>({
    resolver: zodResolver(createDemandSchema),
    defaultValues: blankForm(workdayEnd, projects),
  });
  const values = useWatch({ control: form.control });

  // os chips não são inputs nativos: gravam direto no form
  function pick<K extends keyof CreateDemandInput>(key: K, value: CreateDemandInput[K]) {
    form.setValue(key, value as PathValue<CreateDemandInput, K>, { shouldDirty: true });
  }

  const submit = form.handleSubmit(async (data) => {
    const result = await createDemand(data);
    if (!result.ok) return form.setError("root", { message: result.error });
    onDone();
    toast("anotado. agora não tem desculpa.", () => void deleteDemand(result.id));
  });

  const error = form.formState.errors.title?.message ?? form.formState.errors.root?.message ?? "";

  return { form, values: values as CreateDemandInput, pick, submit, error };
}
