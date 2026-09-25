"use client";

import { useRouter } from "next/navigation";
import type { ProjectDTO } from "@/lib/demand";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { filterHref, type StatusFilter } from "./listFilters";

interface ProjectSelectProps {
  projects: ProjectDTO[];
  status: StatusFilter;
  value: string | null;
}

// o Radix Select não aceita value vazio, então "todos" vira "all"
const ALL = "all";

export function ProjectSelect({ projects, status, value }: ProjectSelectProps) {
  const router = useRouter();

  function handleChangeProjectSelect(next: string) {
    router.push(filterHref(status, next === ALL ? null : next));
  }

  return (
    <Select value={value ?? ALL} onValueChange={handleChangeProjectSelect}>
      <SelectTrigger aria-label="projeto" className="ml-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>todos os projetos</SelectItem>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="size-2 rounded-full" style={{ background: p.color }} />
              {p.name.toLowerCase()}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
