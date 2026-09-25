"use client";

import { useRouter } from "next/navigation";
import type { DemandDTO, ProjectDTO } from "@/lib/demand";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DemandDetail } from "./DemandDetail";

interface DemandDrawerProps {
  demand: DemandDTO;
  projects: ProjectDTO[];
}

/** Drawer à direita (440px) no desktop, tela cheia no mobile. Fecha voltando no histórico. */
export function DemandDrawer({ demand, projects }: DemandDrawerProps) {
  const router = useRouter();

  function handleClose() {
    router.back();
  }
  function handleOpenChangeDrawer(open: boolean) {
    if (!open) handleClose();
  }

  return (
    <Dialog open onOpenChange={handleOpenChangeDrawer}>
      <DialogContent className="animate-slide-in inset-0 md:left-auto md:w-[440px] md:max-w-full md:shadow-lg">
        <DialogTitle>{demand.title}</DialogTitle>
        <DemandDetail key={demand.id} demand={demand} projects={projects} onClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}
