import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEvent, fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { demand, projects, renderWithApp } from "@/test/fixtures";

vi.mock("next/link", async () => (await import("@/test/nextMocks")).linkMock);
const updateDemand = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
vi.mock("@/actions/demandActions", () => ({ updateDemand, deleteDemand: vi.fn(), restoreDemand: vi.fn() }));

import { KanbanBoard } from "../_components/KanbanBoard";

describe("KanbanBoard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("4 colunas com contadores", () => {
    renderWithApp(
      <KanbanBoard demands={[demand({ status: "todo" }), demand({ status: "waiting" })]} projects={projects} />,
    );
    for (const name of ["a fazer", "fazendo", "esperando alguém", "feito"]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
    expect(within(screen.getByRole("region", { name: "esperando alguém" })).getByText("1")).toBeInTheDocument();
  });

  it("→ avança o status e o card muda de coluna na hora", async () => {
    const d = demand({ status: "todo", title: "Briefing" });
    renderWithApp(<KanbanBoard demands={[d]} projects={projects} />);
    await userEvent.click(screen.getByRole("button", { name: "Avançar Briefing" }));
    expect(updateDemand).toHaveBeenCalledWith(d.id, { status: "doing" });
  });

  it("soltar em 'feito' conclui", () => {
    const d = demand({ status: "doing" });
    renderWithApp(<KanbanBoard demands={[d]} projects={projects} />);
    const done = screen.getByRole("region", { name: "feito" });
    const drop = createEvent.drop(done);
    Object.defineProperty(drop, "dataTransfer", { value: { getData: () => d.id } });
    fireEvent.dragOver(done);
    expect(done.className).toContain("outline-accent");
    fireEvent(done, drop);
    expect(updateDemand).toHaveBeenCalledWith(d.id, { status: "done" });
  });

  it("feita não tem botão de avançar", () => {
    renderWithApp(<KanbanBoard demands={[demand({ status: "done", title: "Pronto" })]} projects={projects} />);
    expect(screen.queryByRole("button", { name: "Avançar Pronto" })).not.toBeInTheDocument();
  });
});
