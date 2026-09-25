import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithApp } from "@/test/fixtures";

const updatePrefs = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
vi.mock("@/actions/profileActions", () => ({ updatePrefs, subscribePush: vi.fn(), unsubscribePush: vi.fn() }));

import { PrefsGroup } from "../_components/PrefsGroup";
import { Switch } from "../_components/Switch";

it("Switch é um role=switch", async () => {
  const onToggle = vi.fn();
  render(<Switch checked label="push" onToggle={onToggle} />);
  const sw = screen.getByRole("switch", { name: "push" });
  expect(sw).toHaveAttribute("aria-checked", "true");
  await userEvent.click(sw);
  expect(onToggle).toHaveBeenCalled();
});

describe("PrefsGroup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("troca a antecedência", async () => {
    renderWithApp(<PrefsGroup pushEnabled={false} lead="1h" workdayEnd="18:00" />);
    expect(screen.getByRole("radio", { name: "1 h" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("radio", { name: "1 dia" }));
    expect(updatePrefs).toHaveBeenCalledWith({ lead: "1d" });
  });

  it("troca o fim do expediente", () => {
    renderWithApp(<PrefsGroup pushEnabled={false} lead="1h" workdayEnd="18:00" />);
    fireEvent.change(screen.getByLabelText("fim do expediente"), { target: { value: "17:30" } });
    expect(updatePrefs).toHaveBeenCalledWith({ workdayEnd: "17:30" });
  });

  it("sem suporte a push, explica em vez de ligar", async () => {
    renderWithApp(<PrefsGroup pushEnabled={false} lead="1h" workdayEnd="18:00" />);
    await userEvent.click(screen.getByRole("switch", { name: "notificação push" }));
    expect(await screen.findByText(/instala o app na tela de início/)).toBeInTheDocument();
    expect(updatePrefs).not.toHaveBeenCalled();
  });
});
