import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip } from "../Chip";
import { OptionalChips, ProjectChips } from "../DemandChips";
import { FormGroup, FormRow } from "../FormGroup";
import { Lockup, LogoMark } from "../Logo";
import { PageTitle } from "../PageTitle";
import { PrioPicker } from "../PrioPicker";
import { ListSkeleton } from "../Skeleton";
import { projects } from "@/test/fixtures";

describe("Chip", () => {
  it("expõe o estado com aria-pressed", () => {
    render(<Chip active>todas</Chip>);
    expect(screen.getByRole("button", { name: "todas" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("PrioPicker", () => {
  it("marca a atual e troca", async () => {
    const onChange = vi.fn();
    render(<PrioPicker value="alta" onChange={onChange} />);
    expect(screen.getByRole("radio", { name: "alta" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("radio", { name: "urgente" }));
    expect(onChange).toHaveBeenCalledWith("urgente");
  });
});

describe("OptionalChips", () => {
  it("tocar no ativo desmarca", async () => {
    const onChange = vi.fn();
    render(<OptionalChips label="empresa" options={["ITSS", "Neobiz"]} value="ITSS" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "ITSS" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
    await userEvent.click(screen.getByRole("button", { name: "Neobiz" }));
    expect(onChange).toHaveBeenLastCalledWith("Neobiz");
  });
});

describe("ProjectChips", () => {
  it("lista em minúsculas e escolhe", async () => {
    const onChange = vi.fn();
    render(<ProjectChips projects={projects} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "financeiro" }));
    expect(onChange).toHaveBeenCalledWith(projects[1].id);
  });
  it("sem projetos, aponta onde criar", () => {
    render(<ProjectChips projects={[]} value={null} onChange={vi.fn()} />);
    expect(screen.getByText("crie em projetos")).toBeInTheDocument();
  });
});

it("FormRow liga o rótulo ao campo", () => {
  render(
    <FormGroup>
      <FormRow label="quem pediu" htmlFor="x">
        <input id="x" />
      </FormRow>
    </FormGroup>,
  );
  expect(screen.getByLabelText("quem pediu")).toBeInTheDocument();
});

it("Lockup e marca", () => {
  const { container } = render(
    <>
      <Lockup />
      <LogoMark size={44} />
    </>,
  );
  expect(container.textContent).toContain("pqp, era pra hoje?");
  expect(container.querySelectorAll("svg")[1]).toHaveAttribute("width", "44");
});

it("PageTitle é h1", () => {
  render(<PageTitle>quadro</PageTitle>);
  expect(screen.getByRole("heading", { level: 1, name: "quadro" })).toBeInTheDocument();
});

it("ListSkeleton anuncia carregamento", () => {
  render(<ListSkeleton rows={3} />);
  expect(screen.getByRole("status", { name: "carregando" }).children).toHaveLength(3);
});
