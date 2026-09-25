import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { demand, projects, renderWithApp } from "@/test/fixtures";

vi.mock("next/link", async () => (await import("@/test/nextMocks")).linkMock);
vi.mock("next/navigation", async () => (await import("@/test/nextMocks")).navigationMock);
vi.mock("@/actions/demandActions", () => ({ updateDemand: vi.fn() }));

import { SearchView } from "../_components/SearchView";
import { useRecentSearches } from "../_hooks/useRecentSearches";

const list = [
  demand({ title: "Proposta Acme" }),
  demand({ title: "Relatório", notes: "falar com a acme" }),
  demand({ title: "Outra" }),
];

describe("SearchView", () => {
  beforeEach(() => localStorage.clear());

  it("busca em título e anotações", async () => {
    renderWithApp(<SearchView demands={list} projects={projects} initialQuery="" />);
    await userEvent.type(screen.getByLabelText("procurar"), "acme");
    expect(screen.getAllByRole("link").map((a) => a.textContent)).toEqual(["Proposta Acme", "Relatório"]);
  });

  it("sem resultado", () => {
    renderWithApp(<SearchView demands={list} projects={projects} initialQuery="zzz" />);
    expect(screen.getByText('nada com "zzz". nem no papel.')).toBeInTheDocument();
  });

  it("limpar volta pras recentes", async () => {
    localStorage.setItem("pqp:buscas", JSON.stringify(["carla"]));
    renderWithApp(<SearchView demands={list} projects={projects} initialQuery="acme" />);
    await userEvent.click(screen.getByRole("button", { name: "Limpar" }));
    await userEvent.click(screen.getByRole("button", { name: "carla" }));
    expect(screen.getByLabelText("procurar")).toHaveValue("carla");
  });
});

it("useRecentSearches guarda as 5 últimas, sem repetir", () => {
  localStorage.clear();
  const { result } = renderHook(() => useRecentSearches());
  act(() => ["a1", "b2", "c3", "d4", "e5", "f6", "b2", "x"].forEach(result.current.remember));
  expect(result.current.recent).toEqual(["b2", "f6", "e5", "d4", "c3"]);
});
