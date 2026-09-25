"use client";

import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { ProjectDTO } from "@/lib/demand";
import { filterHref, type StatusFilter } from "./listFilters";

interface ProjectSelectProps {
  projects: ProjectDTO[];
  status: StatusFilter;
  value: string | null;
}

export function ProjectSelect({ projects, status, value }: ProjectSelectProps) {
  const router = useRouter();

  function handleChangeProjectSelect(e: ChangeEvent<HTMLSelectElement>) {
    router.push(filterHref(status, e.target.value === "all" ? null : e.target.value));
  }

  return (
    <select
      aria-label="projeto"
      value={value ?? "all"}
      onChange={handleChangeProjectSelect}
      className="border-divider ml-auto min-h-[34px] rounded-[10px] border bg-transparent px-2.5 text-sm text-neutral-300"
    >
      <option value="all">todos os projetos</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name.toLowerCase()}
        </option>
      ))}
    </select>
  );
}
