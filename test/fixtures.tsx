import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { NowProvider } from "@/contexts/NowContext";
import { ToastProvider } from "@/contexts/ToastContext";
import type { DemandDTO, ProjectDTO } from "@/lib/demand";

export const TZ = "America/Sao_Paulo";
/** Quinta, 24/09/2026, 14:00 em São Paulo (UTC-3). */
export const NOW = Date.UTC(2026, 8, 24, 17, 0);
export const MIN = 60000;
export const DAY = 864e5;

export const projects: ProjectDTO[] = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Marketing", color: "oklch(0.70 0.17 35)" },
  { id: "22222222-2222-4222-8222-222222222222", name: "Financeiro", color: "oklch(0.80 0.13 80)" },
];

let seq = 0;
export function demand(patch: Partial<DemandDTO> = {}): DemandDTO {
  seq++;
  return {
    id: `00000000-0000-4000-8000-${String(seq).padStart(12, "0")}`,
    title: `demanda ${seq}`,
    due: NOW + 2 * 60 * MIN,
    prio: "media",
    requester: "Carla",
    projectId: projects[0].id,
    company: null,
    dept: null,
    status: "todo",
    prevStatus: null,
    notes: "",
    ...patch,
  };
}

export function renderWithApp(ui: ReactNode) {
  return render(
    <NowProvider initialNow={NOW} tz={TZ}>
      <ToastProvider>{ui}</ToastProvider>
    </NowProvider>,
  );
}
