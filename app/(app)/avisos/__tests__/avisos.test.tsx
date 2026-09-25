import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NOW, renderWithApp } from "@/test/fixtures";

vi.mock("next/navigation", async () => (await import("@/test/nextMocks")).navigationMock);
const markNotificationRead = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
const markAllNotificationsRead = vi.hoisted(() => vi.fn(async () => ({ ok: true })));
vi.mock("@/actions/notificationActions", () => ({ markNotificationRead, markAllNotificationsRead }));

import { MarkAllReadButton } from "../_components/MarkAllReadButton";
import { NotificationItem } from "../_components/NotificationItem";
import { router } from "@/test/nextMocks";

const base = { id: "n1", demandId: "d1", text: "Faltam 50 min pra X.", createdAt: NOW - 3 * 3600000, unread: true };

describe("NotificationItem", () => {
  beforeEach(() => vi.clearAllMocks());

  it("não lida: marca e abre a demanda", async () => {
    renderWithApp(<NotificationItem notification={base} />);
    expect(screen.getByText("3h")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button"));
    expect(router.push).toHaveBeenCalledWith("/d/d1", { scroll: false });
    expect(markNotificationRead).toHaveBeenCalledWith("n1");
  });

  it("lida e sem demanda: não faz nada", async () => {
    renderWithApp(<NotificationItem notification={{ ...base, unread: false, demandId: null }} />);
    await userEvent.click(screen.getByRole("button"));
    expect(router.push).not.toHaveBeenCalled();
    expect(markNotificationRead).not.toHaveBeenCalled();
  });
});

it("marcar todas como lidas", async () => {
  renderWithApp(<MarkAllReadButton />);
  await userEvent.click(screen.getByRole("button", { name: "marcar como lido" }));
  expect(markAllNotificationsRead).toHaveBeenCalled();
});
