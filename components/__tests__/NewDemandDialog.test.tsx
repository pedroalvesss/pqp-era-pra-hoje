import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
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

  it("cancelar fecha", async () => {
    const onClose = vi.fn();
    renderWithApp(<NewDemandDialog projects={projects} workdayEnd="18:00" onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "cancelar" }));
    expect(onClose).toHaveBeenCalled();
  });
});
