import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, resetDb, seedUser, type TestDb } from "@/test/db";
import { demand as fakeDemand } from "@/test/fixtures";
import { demands, notifications, passwordResetTokens, projects, pushSubscriptions, users } from "@/db/schema";

const ctx = vi.hoisted(() => ({ db: null as unknown, userId: "" }));
vi.mock("@/db", () => ({
  get db() {
    return ctx.db;
  },
}));
vi.mock("next/navigation", () => ({
  redirect: (to: string) => {
    throw new Error(`redirect:${to}`);
  },
}));
vi.mock("@/services/authService/getCurrentUser", () => ({
  getCurrentUser: async () => ({ id: ctx.userId, email: "pedro@x.com" }),
}));

import { getUserByEmail } from "../usuariosService/getUserByEmail";
import { postUser } from "../usuariosService/postUser";
import { postPasswordResetToken } from "../usuariosService/postPasswordResetToken";
import { patchUserPasswordByResetToken } from "../usuariosService/patchUserPasswordByResetToken";
import { getProfile } from "../perfisService/getProfile";
import { patchProfile } from "../perfisService/patchProfile";
import { getDemands } from "../demandasService/getDemands";
import { getDemandById } from "../demandasService/getDemandById";
import { postDemand } from "../demandasService/postDemand";
import { patchDemandById } from "../demandasService/patchDemandById";
import { deleteDemandById } from "../demandasService/deleteDemandById";
import { postDemandRestore } from "../demandasService/postDemandRestore";
import { getProjects } from "../projetosService/getProjects";
import { postProject } from "../projetosService/postProject";
import { getNotifications } from "../avisosService/getNotifications";
import { getUnreadNotificationsCount } from "../avisosService/getUnreadNotificationsCount";
import { patchNotificationsRead } from "../avisosService/patchNotificationsRead";
import { postPushSubscription } from "../pushService/postPushSubscription";
import { deletePushSubscription } from "../pushService/deletePushSubscription";
import { verifyPassword } from "@/lib/password";

let db: TestDb;
let me: string;
let other: string;
const due = Date.UTC(2026, 8, 24, 21, 0);
const input = {
  title: "Enviar proposta",
  due,
  prio: "alta" as const,
  requester: "Carla",
  projectId: null,
  company: null,
  dept: null,
};

beforeAll(async () => {
  db = await createTestDb();
  ctx.db = db;
}, 60000);

beforeEach(async () => {
  await resetDb(db);
  me = await seedUser(db, "pedro@x.com");
  other = await seedUser(db, "outra@x.com");
  ctx.userId = me;
});

function as(userId: string) {
  ctx.userId = userId;
}

describe("usuários e senha", () => {
  it("cadastro não duplica e-mail (sem diferenciar maiúscula)", async () => {
    expect(await postUser({ name: "A", email: "Nova@X.com", password: "123456", timezone: "America/Belem" })).toBe(
      true,
    );
    expect(await postUser({ name: "B", email: "nova@x.com", password: "654321", timezone: "UTC" })).toBe(false);
    const user = await getUserByEmail(" NOVA@x.com ");
    expect(user?.name).toBe("A");
    expect(await verifyPassword("123456", user!.passwordHash)).toBe(true);
  });

  it("reset: token vale 1 vez, dentro do prazo", async () => {
    const reset = await postPasswordResetToken("pedro@x.com");
    expect(reset?.email).toBe("pedro@x.com");
    expect(await patchUserPasswordByResetToken("errado", "novasenha")).toBeNull();
    expect(await patchUserPasswordByResetToken(reset!.token, "novasenha")).toBe("pedro@x.com");
    expect(await patchUserPasswordByResetToken(reset!.token, "outra")).toBeNull();
    const [row] = await db.select({ h: users.passwordHash }).from(users).where(eq(users.id, me));
    expect(await verifyPassword("novasenha", row.h)).toBe(true);
  });

  it("reset: token vencido não vale e e-mail desconhecido não gera token", async () => {
    const reset = await postPasswordResetToken("pedro@x.com", Date.now() - 2 * 3600000);
    expect(await patchUserPasswordByResetToken(reset!.token, "novasenha")).toBeNull();
    expect(await postPasswordResetToken("ninguem@x.com")).toBeNull();
    expect(await db.select().from(passwordResetTokens)).toHaveLength(1);
  });

  it("sessão de conta apagada derruba o login", async () => {
    await db.delete(users).where(eq(users.id, me));
    await expect(getProfile()).rejects.toThrow("redirect:/sair");
  });

  it("perfil: lê e atualiza as preferências", async () => {
    await patchProfile({ lead: "1d", workdayEnd: "17:30" });
    expect(await getProfile()).toMatchObject({ name: "Pedro", lead: "1d", workdayEnd: "17:30", pushEnabled: true });
  });
});

describe("demandas", () => {
  it("cria, lista só as minhas e busca por id", async () => {
    const id = await postDemand(input);
    as(other);
    await postDemand({ ...input, title: "dela" });
    expect(await getDemandById(id)).toBeNull();
    as(me);
    const list = await getDemands();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id, title: "Enviar proposta", due, status: "todo", company: null });
    expect(await getDemandById(id)).toEqual(list[0]);
  });

  it("não deixa usar projeto de outra pessoa", async () => {
    as(other);
    await postProject("dela");
    const [theirs] = await getProjects();
    as(me);
    await expect(postDemand({ ...input, projectId: theirs.id })).rejects.toThrow("projeto não encontrado");
  });

  it("concluir guarda o status anterior; reabrir limpa", async () => {
    const id = await postDemand(input);
    await patchDemandById(id, { status: "doing" });
    await patchDemandById(id, { status: "done" });
    let [row] = await db.select().from(demands).where(eq(demands.id, id));
    expect(row.prevStatus).toBe("doing");
    expect(row.doneAt).toBeInstanceOf(Date);
    await patchDemandById(id, { status: "doing" });
    [row] = await db.select().from(demands).where(eq(demands.id, id));
    expect(row.doneAt).toBeNull();
  });

  it("prazo novo zera o aviso", async () => {
    const id = await postDemand(input);
    await db.update(demands).set({ notifiedAt: new Date() }).where(eq(demands.id, id));
    await patchDemandById(id, { due: due + 864e5, title: "novo título" });
    const [row] = await db.select().from(demands).where(eq(demands.id, id));
    expect(row).toMatchObject({ notifiedAt: null, title: "novo título" });
  });

  it("outra pessoa não edita nem apaga a minha", async () => {
    const id = await postDemand(input);
    as(other);
    await expect(patchDemandById(id, { status: "done" })).rejects.toThrow("demanda não encontrada");
    await patchDemandById(id, { title: "hackeado" });
    await deleteDemandById(id);
    as(me);
    expect((await getDemandById(id))?.title).toBe("Enviar proposta");
  });

  it("apagar e desfazer recria com o mesmo id", async () => {
    const d = fakeDemand({ due });
    await postDemandRestore({ ...d, projectId: null });
    await deleteDemandById(d.id);
    expect(await getDemands()).toHaveLength(0);
    await postDemandRestore({ ...d, projectId: null });
    expect((await getDemandById(d.id))?.title).toBe(d.title);
  });
});

it("projetos: cor segue a rotação da paleta", async () => {
  await postProject("A");
  await postProject("B");
  const list = await getProjects();
  expect(list.map((p) => p.name)).toEqual(["A", "B"]);
  expect(list[0].color).not.toBe(list[1].color);
});

it("avisos: conta, lista e marca como lidos só os meus", async () => {
  await db.insert(notifications).values([
    { userId: me, text: "um" },
    { userId: me, text: "dois" },
    { userId: other, text: "dela" },
  ]);
  expect(await getUnreadNotificationsCount()).toBe(2);
  const [first] = await getNotifications();
  await patchNotificationsRead(first.id);
  expect(await getUnreadNotificationsCount()).toBe(1);
  await patchNotificationsRead();
  expect(await getUnreadNotificationsCount()).toBe(0);
  as(other);
  expect(await getUnreadNotificationsCount()).toBe(1);
});

it("push: assinatura por aparelho, sem apagar a dos outros", async () => {
  const sub = { endpoint: "https://push/1", keys: { p256dh: "k", auth: "a" } };
  await postPushSubscription(sub);
  await postPushSubscription({ ...sub, keys: { p256dh: "k2", auth: "a2" } });
  expect(await db.select().from(pushSubscriptions)).toMatchObject([{ p256dh: "k2", userId: me }]);
  as(other);
  await deletePushSubscription(sub.endpoint);
  expect(await db.select().from(pushSubscriptions)).toHaveLength(1);
});

it("apagar projeto deixa a demanda sem projeto", async () => {
  await postProject("temp");
  const [p] = await getProjects();
  const id = await postDemand({ ...input, projectId: p.id });
  await db.delete(projects).where(eq(projects.id, p.id));
  expect((await getDemandById(id))?.projectId).toBeNull();
});
