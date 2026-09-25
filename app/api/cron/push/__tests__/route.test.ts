import { afterEach, describe, expect, it, vi } from "vitest";

const sendDueReminders = vi.hoisted(() => vi.fn(async () => ({ sent: 3 })));
vi.mock("@/services/pushService/sendDueReminders", () => ({ sendDueReminders }));

import { POST } from "../route";

function call(auth?: string) {
  return POST(new Request("http://x/api/cron/push", { method: "POST", headers: auth ? { authorization: auth } : {} }));
}

describe("POST /api/cron/push", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("sem segredo configurado, ninguém entra", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect((await call("Bearer ")).status).toBe(401);
  });

  it("segredo errado", async () => {
    vi.stubEnv("CRON_SECRET", "s3cr3t");
    expect((await call("Bearer nope")).status).toBe(401);
    expect(sendDueReminders).not.toHaveBeenCalled();
  });

  it("segredo certo roda os lembretes", async () => {
    vi.stubEnv("CRON_SECRET", "s3cr3t");
    const res = await call("Bearer s3cr3t");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ sent: 3 });
  });
});
