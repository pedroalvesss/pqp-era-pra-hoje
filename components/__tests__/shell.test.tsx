import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("next/link", async () => (await import("@/test/nextMocks")).linkMock);
vi.mock("next/navigation", async () => (await import("@/test/nextMocks")).navigationMock);
const openNewDemand = vi.hoisted(() => vi.fn());
vi.mock("@/contexts/NewDemandContext", () => ({ useNewDemand: () => ({ openNewDemand }) }));

import { MobileTopBar } from "../shell/MobileTopBar";
import { Sidebar } from "../shell/Sidebar";
import { TabBar } from "../shell/TabBar";
import { isActive } from "../shell/navItems";
import { nav } from "@/test/nextMocks";

it("isActive: início só na raiz", () => {
  expect(isActive("/", "/")).toBe(true);
  expect(isActive("/demandas", "/")).toBe(false);
  expect(isActive("/demandas", "/demandas")).toBe(true);
});

describe("Sidebar", () => {
  it("marca a rota atual, mostra não lidas e abre nova demanda", () => {
    nav.pathname = "/quadro";
    render(<Sidebar userName="Pedro" unread={2} />);
    expect(screen.getByRole("link", { name: "quadro" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /avisos/ })).toHaveTextContent("2");
    expect(screen.getByRole("link", { name: /pedro/ })).toHaveAttribute("href", "/perfil");
    fireEvent.click(screen.getByRole("button", { name: /nova demanda/ }));
    expect(openNewDemand).toHaveBeenCalled();
  });
});

describe("mobile", () => {
  it("tab bar com o + no meio", () => {
    nav.pathname = "/";
    render(<TabBar />);
    const items = screen.getByRole("navigation").children;
    expect(items[2]).toHaveAccessibleName("Nova demanda");
    expect(screen.getByRole("link", { name: "início" })).toHaveAttribute("aria-current", "page");
  });

  it("barra de cima avisa não lidas", () => {
    render(<MobileTopBar userName="Pedro" unread={1} />);
    expect(screen.getByRole("link", { name: "Avisos, 1 não lidos" })).toBeInTheDocument();
  });
});
