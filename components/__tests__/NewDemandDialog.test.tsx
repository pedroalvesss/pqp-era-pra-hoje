import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { projects, renderWithApp } from "@/test/fixtures";

const createDemand = vi.hoisted(() => vi.fn(async () => ({ ok: true, id: "novo" })));
const deleteDemand = vi.hoisted(() => vi.fn());
vi.mock("@/actions/demandActions", () => ({ createDemand, deleteDemand }));

import NewDemandDialog from "../new-demand/NewDemandDialog";

describe("NewDemandDialog", () => {
  beforeEach(() => vi.clearAllMocks());

  it("título vazio mostra a bronca e não salva", async () => {
    renderWithApp(<NewDemandDialog projects={projects} workdayEnd="18:00" onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "anotar" }));
    expect(screen.getByRole("alert")).toHaveTextContent("escreve pelo menos o que é, né.");
    expect(createDemand).not.toHaveBeenCalled();
  });

  it("enter no título salva com os valores escolhidos, fecha e oferece desfazer", async () => {
    const onClose = vi.fn();
    renderWithApp(<NewDemandDialog projects={projects} workdayEnd="17:30" onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "amanhã" }));
    await userEvent.click(screen.getByRole("radio", { name: "urgente" }));
    await userEvent.click(screen.getByRole("button", { name: "ITSS" }));
    await userEvent.type(screen.getByPlaceholderText("ninguém?"), "Carla");
    await userEvent.type(screen.getByPlaceholderText("o que pediram?"), "Enviar proposta{Enter}");

    expect(createDemand).toHaveBeenCalledWith({
      title: "Enviar proposta",
      day: "amanha",
      date: null,
      time: "17:30",
      prio: "urgente",
      requester: "Carla",
      projectId: projects[0].id,
      company: "ITSS",
      dept: null,
    });
    expect(onClose).toHaveBeenCalled();
    // o mock de onClose não desmonta o modal, então o Radix segue travando o body (sem o CSS do toast)
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    await user.click(await screen.findByRole("button", { name: "desfazer" }));
    expect(deleteDemand).toHaveBeenCalledWith("novo");
  });

  it("outro dia: escolhe no calendário e o chip mostra a data", async () => {
    // só o Date é falso: 24/09/2026. Os timers seguem reais pro user-event
    vi.useFakeTimers({ now: new Date(2026, 8, 24, 14), toFake: ["Date"] });
    renderWithApp(<NewDemandDialog projects={projects} workdayEnd="18:00" onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "escolher dia no calendário" }));
    const grid = await screen.findByRole("grid");
    expect(within(grid).getByRole("button", { name: /23 de setembro/ })).toBeDisabled();
    await userEvent.click(within(grid).getByRole("button", { name: /30 de setembro/ }));
    expect(screen.getByRole("button", { name: "dia escolhido: qua, 30/09" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "amanhã" })).toHaveAttribute("aria-pressed", "false");
    await userEvent.type(screen.getByPlaceholderText("o que pediram?"), "Reunião{Enter}");
    expect(createDemand).toHaveBeenCalledWith(expect.objectContaining({ day: "data", date: "2026-09-30" }));
    vi.useRealTimers();
  });

  it("cancelar fecha", async () => {
    const onClose = vi.fn();
    renderWithApp(<NewDemandDialog projects={projects} workdayEnd="18:00" onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "cancelar" }));
    expect(onClose).toHaveBeenCalled();
  });
});
