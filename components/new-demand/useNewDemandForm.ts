"use client";

import { useState, useTransition } from "react";
import { createDemand, deleteDemand } from "@/actions/demandActions";
import type { ProjectDTO } from "@/lib/demand";
import type { CreateDemandInput } from "@/lib/schemas";
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
  const [form, setForm] = useState(() => blankForm(workdayEnd, projects));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function set<K extends keyof CreateDemandInput>(key: K, value: CreateDemandInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "title") setError("");
  }

  function submit() {
    if (!form.title.trim()) return setError("escreve pelo menos o que é, né.");
    startTransition(async () => {
      const result = await createDemand(form);
      if (!result.ok) return setError(result.error);
      onDone();
      toast("anotado. agora não tem desculpa.", () => void deleteDemand(result.id));
    });
  }

  return { form, set, error, pending, submit };
}
