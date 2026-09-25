import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, resetDb, seedUser, type TestDb } from "@/test/db";
import { NOW } from "@/test/fixtures";
import { demands, notifications, pushSubscriptions, users } from "@/db/schema";

const ctx = vi.hoisted(() => ({ db: null as unknown }));
const push = vi.hoisted(() => ({ sendNotification: vi.fn(), setVapidDetails: vi.fn() }));
vi.mock("@/db", () => ({
  get db() {
    return ctx.db;
  },
}));
vi.mock("@/lib/env", () => ({ env: (n: string) => n }));
vi.mock("web-push", () => ({ default: push }));

import { sendDueReminders } from "../pushService/sendDueReminders";

let db: TestDb;
let userId: string;

async function addDemand(minutesLeft: number, patch = {}) {
  const [row] = await db
    .insert(demands)
    .values({ userId, title: "Enviar proposta", due: new Date(NOW + minutesLeft * 60000), ...patch })
    .returning({ id: demands.id });
  return row.id;
}

async function addDevice(endpoint = "https://push/1") {
  await db.insert(pushSubscriptions).values({ endpoint, userId, p256dh: "k", auth: "a" });
}

describe("sendDueReminders", () => {
  beforeAll(async () => {
    db = await createTestDb();
    ctx.db = db;
  }, 60000);

  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDb(db);
    userId = await seedUser(db);
  });

  it("avisa uma vez, grava o aviso e manda pra cada aparelho", async () => {
    const id = await addDemand(50);
    await addDevice("https://push/1");
    await addDevice("https://push/2");
    expect(await sendDueReminders(NOW)).toEqual({ sent: 2 });
    expect(JSON.parse(push.sendNotification.mock.calls[0][1])).toMatchObject({ url: `/d/${id}` });
    const [n] = await db.select().from(notifications);
    expect(n.text).toContain("Faltam 50 min");
    expect(await sendDueReminders(NOW)).toEqual({ sent: 0 });
  });

  it("respeita a antecedência do usuário e ignora feitas", async () => {
    await addDemand(120);
    await addDemand(30, { status: "done" });
    expect(await sendDueReminders(NOW)).toEqual({ sent: 0 });
    await db.update(users).set({ lead: "1d" });
    await addDevice();
    expect(await sendDueReminders(NOW)).toEqual({ sent: 1 });
  });

  it("push desligado ainda gera o aviso no app", async () => {
    await db.update(users).set({ pushEnabled: false });
    await addDemand(10);
    await addDevice();
    await sendDueReminders(NOW);
    expect(push.sendNotification).not.toHaveBeenCalled();
    expect(await db.select().from(notifications)).toHaveLength(1);
  });

  it("assinatura morta (410) é apagada", async () => {
    push.sendNotification.mockRejectedValueOnce({ statusCode: 410 });
    await addDemand(10);
    await addDevice();
    await sendDueReminders(NOW);
    expect(await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId))).toHaveLength(0);
  });
});
