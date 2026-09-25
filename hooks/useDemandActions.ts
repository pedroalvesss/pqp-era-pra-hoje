"use client";

import { deleteDemand, restoreDemand, updateDemand } from "@/actions/demandActions";
import type { ActionResult } from "@/actions/result";
import { DONE_LINES, type Status } from "@/lib/constants";
import { plusOneDay } from "@/lib/dates";
import { nextStatus, type DemandDTO } from "@/lib/demand";
import type { UpdateDemandInput } from "@/lib/schemas";
import { useNow } from "@/contexts/NowContext";
import { useToast } from "@/contexts/ToastContext";

/** Mutações de demanda com os toasts e o "desfazer" do design. */
export function useDemandActions() {
  const toast = useToast();
  const { tz } = useNow();

  function report(result: ActionResult) {
    if (!result.ok) toast(result.error);
    return result.ok;
  }

  async function save(id: string, patch: UpdateDemandInput) {
    return report(await updateDemand(id, patch));
  }

  async function complete(d: DemandDTO) {
    const before = d.status;
    if (!(await save(d.id, { status: "done" }))) return;
    const line = DONE_LINES[Math.floor(Math.random() * DONE_LINES.length)];
    toast(line, () => void save(d.id, { status: before }));
  }

  async function setStatus(d: DemandDTO, status: Status) {
    if (status === d.status) return;
    if (status === "done") return complete(d);
    await save(d.id, { status });
  }

  async function toggleDone(d: DemandDTO) {
    if (d.status === "done") return save(d.id, { status: d.prevStatus ?? "todo" });
    return complete(d);
  }

  async function advance(d: DemandDTO) {
    return setStatus(d, nextStatus(d.status));
  }

  async function postpone(d: DemandDTO) {
    if (await save(d.id, { due: plusOneDay(d.due, tz) })) toast("jogado pra amanhã. a gente não julga.");
  }

  async function remove(d: DemandDTO) {
    if (report(await deleteDemand(d.id))) {
      toast("apagada. some da memória também.", () => void restoreDemand(d).then(report));
    }
  }

  return { save, toggleDone, setStatus, advance, postpone, remove };
}
