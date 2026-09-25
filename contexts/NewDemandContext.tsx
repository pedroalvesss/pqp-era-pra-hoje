"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { ProjectDTO } from "@/lib/demand";

const NewDemandDialog = dynamic(() => import("@/components/new-demand/NewDemandDialog"), { ssr: false });

interface NewDemandValue {
  openNewDemand: () => void;
}

const NewDemandContext = createContext<NewDemandValue>({ openNewDemand: () => {} });

interface NewDemandProviderProps {
  projects: ProjectDTO[];
  workdayEnd: string;
  children: ReactNode;
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable);
}

export function NewDemandProvider({ projects, workdayEnd, children }: NewDemandProviderProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDownWindow(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (document.querySelector("[role=dialog]")) return;
      e.preventDefault();
      setOpen(true);
    }
    window.addEventListener("keydown", handleKeyDownWindow);
    return () => window.removeEventListener("keydown", handleKeyDownWindow);
  }, []);

  function handleOpenNewDemand() {
    setOpen(true);
  }

  function handleCloseDialog() {
    setOpen(false);
  }

  return (
    <NewDemandContext value={{ openNewDemand: handleOpenNewDemand }}>
      {children}
      {open && <NewDemandDialog projects={projects} workdayEnd={workdayEnd} onClose={handleCloseDialog} />}
    </NewDemandContext>
  );
}

export function useNewDemand() {
  return useContext(NewDemandContext);
}
