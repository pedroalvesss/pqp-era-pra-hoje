import { beforeEach, describe, expect, it, vi } from "vitest";
import { callOf, fakeSupabase } from "@/test/supabaseMock";
import { demand } from "@/test/fixtures";

const supa = vi.hoisted(() => ({ current: null as unknown }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => supa.current }));

import { mapDemand } from "../demandasService/mapDemand";
import { patchDemandById } from "../demandasService/patchDemandById";
import { postDemand } from "../demandasService/postDemand";
import { postDemandRestore } from "../demandasService/postDemandRestore";
import { getDemands } from "../demandasService/getDemands";

const row = {
  id: "abc",
  title: "Enviar proposta",
  due: "2026-09-24T21:00:00.000Z",
  prio: "alta" as const,
  requester: "Carla",
  project_id: null,
  company: "Neobiz" as const,
  dept: null,
  status: "doing" as const,
  prev_status: null,
  notes: "",
};

describe("mapDemand", () => {
  it("vira DTO com prazo em ms e camelCase", () => {
    expect(mapDemand(row)).toMatchObject({ id: "abc", due: Date.parse(row.due), projectId: null, company: "Neobiz" });
  });
});

describe("demandasService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getDemands mapeia as linhas", async () => {
    const { client } = fakeSupabase([{ data: [row] }]);
    supa.current = client;
    expect(await getDemands()).toEqual([mapDemand(row)]);
  });

  it("postDemand manda snake_case e devolve o id", async () => {
    const { client, queries } = fakeSupabase([{ data: { id: "novo" } }]);
    supa.current = client;
    const id = await postDemand({
      title: "x",
      due: Date.parse(row.due),
      prio: "media",
      requester: "",
      projectId: "p1",
      company: null,
      dept: "QA",
    });
    expect(id).toBe("novo");
    expect(callOf(queries[0], "insert")?.[0]).toMatchObject({ project_id: "p1", dept: "QA", due: row.due });
  });

  it("concluir guarda o status anterior e a hora", async () => {
    const { client, queries } = fakeSupabase([{ data: { status: "doing" } }, {}]);
    supa.current = client;
    await patchDemandById("abc", { status: "done" });
    const patch = callOf(queries[1], "update")?.[0] as Record<string, unknown>;
    expect(patch).toMatchObject({ status: "done", prev_status: "doing" });
    expect(patch.done_at).toEqual(expect.any(String));
    expect(patch).not.toHaveProperty("title");
  });

  it("reabrir limpa done_at", async () => {
    const { client, queries } = fakeSupabase([{ data: { status: "done" } }, {}]);
    supa.current = client;
    await patchDemandById("abc", { status: "todo" });
    expect(callOf(queries[1], "update")?.[0]).toEqual({ status: "todo", done_at: null });
  });

  it("prazo novo zera o aviso", async () => {
    const { client, queries } = fakeSupabase([{}]);
    supa.current = client;
    await patchDemandById("abc", { due: Date.parse(row.due) });
    expect(callOf(queries[0], "update")?.[0]).toEqual({ due: row.due, notified_at: null });
  });

  it("erro do banco sobe", async () => {
    const { client } = fakeSupabase([{ error: new Error("rls") }]);
    supa.current = client;
    await expect(patchDemandById("abc", { title: "y" })).rejects.toThrow("rls");
  });

  it("restaurar recria com o mesmo id", async () => {
    const { client, queries } = fakeSupabase([{}]);
    supa.current = client;
    const d = demand();
    await postDemandRestore(d);
    expect(callOf(queries[0], "insert")?.[0]).toMatchObject({ id: d.id, title: d.title, project_id: d.projectId });
  });
});
