import { beforeEach, describe, expect, it, vi } from "vitest";
import { callOf, fakeSupabase } from "@/test/supabaseMock";
import { NOW } from "@/test/fixtures";

const supa = vi.hoisted(() => ({ current: null as unknown }));
const push = vi.hoisted(() => ({ sendNotification: vi.fn(), setVapidDetails: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createAdminClient: () => supa.current, env: (n: string) => n }));
vi.mock("web-push", () => ({ default: push }));

import { sendDueReminders } from "../pushService/sendDueReminders";

const iso = (ms: number) => new Date(ms).toISOString();
const due = { id: "d1", user_id: "u1", title: "Enviar proposta", due: iso(NOW + 50 * 60000) };
const sub = { endpoint: "https://push/1", user_id: "u1", p256dh: "k", auth: "a" };

describe("sendDueReminders", () => {
  beforeEach(() => vi.clearAllMocks());

  it("avisa, registra e envia pra cada aparelho", async () => {
    const { client, queries } = fakeSupabase([
      { data: [due] },
      { data: [{ id: "u1", lead: "1h", push_enabled: true }] },
      { data: [sub, { ...sub, endpoint: "https://push/2" }] },
      {},
      {},
    ]);
    supa.current = client;
    expect(await sendDueReminders(NOW)).toEqual({ sent: 2 });
    expect(callOf(queries[3], "update")?.[0]).toEqual({ notified_at: iso(NOW) });
    expect(callOf(queries[4], "insert")?.[0]).toMatchObject({
      demand_id: "d1",
      text: expect.stringContaining("Faltam 50 min"),
    });
    expect(JSON.parse(push.sendNotification.mock.calls[0][1])).toMatchObject({ url: "/d/d1" });
  });

  it("fora da antecedência não faz nada", async () => {
    const { client, queries } = fakeSupabase([
      { data: [due] },
      { data: [{ id: "u1", lead: "15m", push_enabled: true }] },
      { data: [sub] },
    ]);
    supa.current = client;
    expect(await sendDueReminders(NOW)).toEqual({ sent: 0 });
    expect(queries).toHaveLength(3);
  });

  it("push desligado ainda gera o aviso no app", async () => {
    const { client, queries } = fakeSupabase([
      { data: [due] },
      { data: [{ id: "u1", lead: "1h", push_enabled: false }] },
      { data: [sub] },
      {},
      {},
    ]);
    supa.current = client;
    await sendDueReminders(NOW);
    expect(queries[4].table).toBe("notifications");
    expect(push.sendNotification).not.toHaveBeenCalled();
  });

  it("assinatura morta (410) é apagada", async () => {
    push.sendNotification.mockRejectedValueOnce({ statusCode: 410 });
    const { client, queries } = fakeSupabase([
      { data: [due] },
      { data: [{ id: "u1", lead: "1h", push_enabled: true }] },
      { data: [sub] },
      {},
      {},
      {},
    ]);
    supa.current = client;
    await sendDueReminders(NOW);
    expect(queries[5].table).toBe("push_subscriptions");
    expect(callOf(queries[5], "eq")).toEqual(["endpoint", sub.endpoint]);
  });

  it("sem demandas pendentes sai cedo", async () => {
    const { client, queries } = fakeSupabase([{ data: [] }]);
    supa.current = client;
    expect(await sendDueReminders(NOW)).toEqual({ sent: 0 });
    expect(queries).toHaveLength(1);
  });
});
