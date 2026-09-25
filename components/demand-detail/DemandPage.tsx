"use client";

import { useRouter } from "next/navigation";
import type { DemandDTO, ProjectDTO } from "@/lib/demand";
import { DemandDetail } from "./DemandDetail";

interface DemandPageProps {
  demand: DemandDTO;
  projects: ProjectDTO[];
}

/** Quando /d/[id] é aberto direto (link do push, refresh), sem drawer por cima de nada. */
export function DemandPage({ demand, projects }: DemandPageProps) {
  const router = useRouter();

  function handleClose() {
    router.push("/");
  }

  return (
    <div className="-mx-3 -mt-3.5 -mb-8 overflow-hidden md:mx-0 md:mt-0 md:mb-0 md:max-w-[520px] md:rounded-[18px] md:shadow-md">
      <DemandDetail key={demand.id} demand={demand} projects={projects} onClose={handleClose} />
    </div>
  );
}
