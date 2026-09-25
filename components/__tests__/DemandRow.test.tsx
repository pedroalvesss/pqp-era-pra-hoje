import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MIN, NOW, demand, projects, renderWithApp } from "@/test/fixtures";

vi.mock("next/link", async () => (await import("@/test/nextMocks")).linkMock);
const updateDemand = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
vi.mock("@/actions/demandActions", () => ({ updateDemand, deleteDemand: vi.fn(), restoreDemand: vi.fn() }));

import { DemandRow } from "../DemandRow";

describe("DemandRow", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mostra quando, título, meta e glifo de prioridade", () => {
    const d = demand({ title: "Enviar proposta", due: NOW + 50 * MIN, prio: "urgente", company: "Neobiz" });
    renderWithApp(<DemandRow demand={d} projects={projects} />);
    expect(screen.getByText("em 50 min")).toHaveClass("text-accent-300");
    expect(screen.getByText("14:50")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Enviar proposta" })).toHaveAttribute("href", `/d/${d.id}`);
    expect(screen.getByText("Neobiz · marketing · Carla")).toBeInTheDocument();
    expect(screen.getByText("!!!")).toBeInTheDocument();
  });

  it("na lista, o status vem antes", () => {
    renderWithApp(<DemandRow demand={demand({ status: "waiting" })} projects={projects} withStatus />);
    expect(screen.getByText("esperando · marketing · Carla")).toBeInTheDocument();
  });

  it("concluir salva, mostra toast e desfaz pro status anterior", async () => {
    const d = demand({ status: "doing" });
    renderWithApp(<DemandRow demand={d} projects={projects} />);
    await userEvent.click(screen.getByRole("button", { name: `Concluir ${d.title}` }));
    expect(updateDemand).toHaveBeenCalledWith(d.id, { status: "done" });
    const toast = await screen.findByRole("status");
    expect(toast.textContent).toMatch(/uma a menos|nem doeu|comemora baixinho/);
    await act(() => userEvent.click(screen.getByRole("button", { name: "desfazer" })));
    expect(updateDemand).toHaveBeenLastCalledWith(d.id, { status: "doing" });
  });

  it("feita aparece riscada e sem glifo", () => {
    const d = demand({ status: "done", prio: "alta" });
    renderWithApp(<DemandRow demand={d} projects={projects} />);
    expect(screen.getByRole("link")).toHaveClass("line-through");
    expect(screen.queryByText("!!")).not.toBeInTheDocument();
    expect(screen.getByText("feito")).toBeInTheDocument();
  });

  it("erro do servidor vira toast", async () => {
    updateDemand.mockResolvedValueOnce({ ok: false, error: "deu ruim. tenta de novo?" } as never);
    const d = demand();
    renderWithApp(<DemandRow demand={d} projects={projects} />);
    await userEvent.click(screen.getByRole("button", { name: `Concluir ${d.title}` }));
    expect(await screen.findByText("deu ruim. tenta de novo?")).toBeInTheDocument();
  });
});
