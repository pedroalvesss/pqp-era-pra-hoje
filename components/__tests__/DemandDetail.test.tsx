import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NOW, demand, projects, renderWithApp } from "@/test/fixtures";

const updateDemand = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
const deleteDemand = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
const restoreDemand = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
vi.mock("@/actions/demandActions", () => ({ updateDemand, deleteDemand, restoreDemand }));

import { DemandDetail } from "../demand-detail/DemandDetail";

describe("DemandDetail", () => {
  beforeEach(() => vi.clearAllMocks());

  function setup(patch = {}) {
    const d = demand({ title: "Revisar contrato", due: Date.UTC(2026, 8, 24, 21, 0), ...patch });
    const onClose = vi.fn();
    renderWithApp(<DemandDetail demand={d} projects={projects} onClose={onClose} />);
    return { d, onClose };
  }

  it("mostra prazo e campos", () => {
    setup();
    expect(screen.getByText("hoje · 18:00")).toBeInTheDocument();
    expect(screen.getByLabelText("título")).toHaveValue("Revisar contrato");
    expect(screen.getByLabelText("prazo")).toHaveValue("2026-09-24");
  });

  it("status salva na hora", async () => {
    const { d } = setup();
    await userEvent.click(screen.getByRole("button", { name: "esperando" }));
    expect(updateDemand).toHaveBeenCalledWith(d.id, { status: "waiting" });
    expect(screen.getByRole("button", { name: "esperando" })).toHaveAttribute("aria-pressed", "true");
  });

  it("texto salva no blur, com debounce", async () => {
    const { d } = setup();
    const notes = screen.getByLabelText("anotações");
    await userEvent.type(notes, "ligar");
    expect(updateDemand).not.toHaveBeenCalled();
    fireEvent.blur(notes);
    expect(updateDemand).toHaveBeenCalledWith(d.id, { notes: "ligar" });
  });

  it("título apagado não é salvo", async () => {
    setup();
    await userEvent.clear(screen.getByLabelText("título"));
    fireEvent.blur(screen.getByLabelText("título"));
    expect(updateDemand).not.toHaveBeenCalled();
  });

  it("joga pra amanhã", async () => {
    const { d } = setup();
    await userEvent.click(screen.getByRole("button", { name: "joga pra amanhã" }));
    expect(updateDemand).toHaveBeenCalledWith(d.id, { due: d.due + 864e5 });
    expect(await screen.findByText("jogado pra amanhã. a gente não julga.")).toBeInTheDocument();
    expect(screen.getByText("amanhã · 18:00")).toBeInTheDocument();
  });

  it("apagar fecha e deixa desfazer", async () => {
    const { d, onClose } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Apagar" }));
    expect(deleteDemand).toHaveBeenCalledWith(d.id);
    expect(onClose).toHaveBeenCalled();
    await act(() => userEvent.click(screen.getByRole("button", { name: "desfazer" })));
    expect(restoreDemand).toHaveBeenCalledWith(d);
  });

  it("feita mostra 'reabrir'", () => {
    setup({ status: "done", due: NOW });
    expect(screen.getByRole("button", { name: "reabrir" })).toBeInTheDocument();
  });
});
