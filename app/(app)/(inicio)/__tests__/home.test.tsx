import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DAY, MIN, NOW, TZ, demand, projects, renderWithApp } from "@/test/fixtures";

vi.mock("next/link", async () => (await import("@/test/nextMocks")).linkMock);
vi.mock("next/navigation", async () => (await import("@/test/nextMocks")).navigationMock);
const quickCreateDemand = vi.hoisted(() => vi.fn(async () => ({ ok: true, id: "q1" })));
const deleteDemand = vi.hoisted(() => vi.fn());
vi.mock("@/actions/demandActions", () => ({ quickCreateDemand, deleteDemand, updateDemand: vi.fn() }));

import { CalendarLeaf } from "../_components/CalendarLeaf";
import { HomeView } from "../_components/HomeView";
import { QuickAdd } from "../_components/QuickAdd";
import { WelcomeToast } from "../_components/WelcomeToast";
import { router } from "@/test/nextMocks";

describe("HomeView", () => {
  it("saudação, h1 dinâmico e as três seções", () => {
    renderWithApp(
      <HomeView
        demands={[demand({ due: NOW - DAY }), demand({ due: NOW + 30 * MIN }), demand({ due: NOW + 2 * DAY })]}
        projects={projects}
        userName="Pedro"
        workdayEnd="18:00"
      />,
    );
    expect(screen.getByText("boa tarde, pedro.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("1 vence hoje. 1 já era.");
    expect(screen.getByRole("region", { name: "já era" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "hoje" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "depois" })).toBeInTheDocument();
  });

  it("dia tranquilo", () => {
    renderWithApp(<HomeView demands={[]} projects={projects} userName="Pedro" workdayEnd="18:00" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("relaxa, hoje tá tranquilo.");
    expect(screen.queryByRole("region", { name: "já era" })).not.toBeInTheDocument();
    expect(screen.getAllByText("relaxa, hoje tá tranquilo.")).toHaveLength(2);
  });
});

it("CalendarLeaf mostra a data e os contadores", () => {
  const { container } = render(<CalendarLeaf now={NOW} tz={TZ} today={3} late={2} done={1} />);
  expect(container.textContent).toContain("24");
  expect(container.textContent).toContain("quinta");
  expect(container.textContent).toContain("setembro");
  expect(container.textContent).toContain("3 hoje2 já era1 feitas");
});

describe("QuickAdd", () => {
  beforeEach(() => vi.clearAllMocks());

  it("enter anota pra hoje e limpa o campo", async () => {
    renderWithApp(<QuickAdd workdayEnd="18:00" />);
    const input = screen.getByLabelText("anotação rápida");
    await userEvent.type(input, "ligar pro Paulo{Enter}");
    expect(quickCreateDemand).toHaveBeenCalledWith("ligar pro Paulo");
    expect(await screen.findByText("anotado pra hoje, 18:00.")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("vazio não faz nada", async () => {
    renderWithApp(<QuickAdd workdayEnd="18:00" />);
    await userEvent.click(screen.getByRole("button", { name: "anotar ↵" }));
    expect(quickCreateDemand).not.toHaveBeenCalled();
  });
});

it("WelcomeToast comemora e limpa a URL", async () => {
  renderWithApp(<WelcomeToast />);
  expect(await screen.findByText("conta criada. adeus, caderninho.")).toBeInTheDocument();
  expect(router.replace).toHaveBeenCalledWith("/");
});
