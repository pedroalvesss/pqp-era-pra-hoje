import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DAY, NOW, TZ, demand, projects, renderWithApp } from "@/test/fixtures";

vi.mock("next/link", async () => (await import("@/test/nextMocks")).linkMock);
const createProject = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
vi.mock("@/actions/projectActions", () => ({ createProject }));

import { NewProjectCard } from "../_components/NewProjectCard";
import { ProjectCard } from "../_components/ProjectCard";
import { projectStats } from "../_components/projectStats";

it("projectStats conta abertas e as de hoje (incluindo atrasadas)", () => {
  const [mkt, fin] = projectStats(
    projects,
    [demand({ due: NOW - DAY }), demand({ due: NOW + 2 * DAY }), demand({ status: "done" })],
    NOW,
    TZ,
  );
  expect(mkt).toMatchObject({ open: 2, forToday: 1 });
  expect(fin).toMatchObject({ open: 0, forToday: 0 });
});

describe("ProjectCard", () => {
  it("abre a lista filtrada", () => {
    render(<ProjectCard project={{ ...projects[0], open: 4, forToday: 2 }} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", `/demandas?projeto=${projects[0].id}`);
    expect(screen.getByText("2 pra hoje")).toHaveClass("text-accent");
  });
  it("nada pra hoje", () => {
    render(<ProjectCard project={{ ...projects[0], open: 0, forToday: 0 }} />);
    expect(screen.getByText("nada pra hoje")).toBeInTheDocument();
  });
});

describe("NewProjectCard", () => {
  it("vira input, Enter cria", async () => {
    renderWithApp(<NewProjectCard />);
    await userEvent.click(screen.getByRole("button", { name: "+ novo projeto" }));
    await userEvent.type(screen.getByLabelText("nome do projeto"), "RH{Enter}");
    expect(createProject).toHaveBeenCalledWith("RH");
  });
  it("Esc cancela", async () => {
    renderWithApp(<NewProjectCard />);
    await userEvent.click(screen.getByRole("button", { name: "+ novo projeto" }));
    await userEvent.type(screen.getByLabelText("nome do projeto"), "x{Escape}");
    expect(screen.getByRole("button", { name: "+ novo projeto" })).toBeInTheDocument();
  });
});
