import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NOW, demand, projects } from "@/test/fixtures";

vi.mock("next/navigation", async () => (await import("@/test/nextMocks")).navigationMock);

import { applyFilters, filterHref, parseStatus } from "../_components/listFilters";
import { ProjectSelect } from "../_components/ProjectSelect";
import { router } from "@/test/nextMocks";

describe("listFilters", () => {
  const list = [
    demand({ status: "todo", due: NOW + 2 }),
    demand({ status: "done", due: NOW }),
    demand({ status: "doing", due: NOW + 1, projectId: projects[1].id }),
  ];

  it("conta por status dentro do projeto e filtra a lista", () => {
    const { list: filtered, counts } = applyFilters(list, "all", projects[0].id);
    expect(counts).toEqual({ all: 2, todo: 1, doing: 0, waiting: 0, done: 1 });
    expect(filtered.map((d) => d.status)).toEqual(["todo", "done"]);
  });

  it("feitas no fim", () => {
    expect(applyFilters(list, "all", null).list.map((d) => d.status)).toEqual(["doing", "todo", "done"]);
  });

  it("status desconhecido vira 'todas'", () => {
    expect(parseStatus("arquivada")).toBe("all");
    expect(parseStatus("waiting")).toBe("waiting");
  });

  it("monta a URL", () => {
    expect(filterHref("all", null)).toBe("/demandas");
    expect(filterHref("done", "p1")).toBe("/demandas?status=done&projeto=p1");
  });
});

describe("ProjectSelect", () => {
  it("mostra o projeto atual e navega mantendo o status", async () => {
    render(<ProjectSelect projects={projects} status="todo" value={projects[0].id} />);
    const trigger = screen.getByRole("combobox", { name: "projeto" });
    expect(trigger).toHaveTextContent("marketing");
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("option", { name: "financeiro" }));
    expect(router.push).toHaveBeenCalledWith(`/demandas?status=todo&projeto=${projects[1].id}`);
  });

  it("'todos os projetos' limpa o filtro", async () => {
    render(<ProjectSelect projects={projects} status="all" value={projects[0].id} />);
    await userEvent.click(screen.getByRole("combobox", { name: "projeto" }));
    await userEvent.click(await screen.findByRole("option", { name: "todos os projetos" }));
    expect(router.push).toHaveBeenLastCalledWith("/demandas");
  });
});
