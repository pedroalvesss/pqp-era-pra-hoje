import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/services/perfisService/getProfile", () => ({
  getProfile: async () => ({ timezone: "America/Sao_Paulo", workdayEnd: "18:00" }),
}));
const postDemand = vi.hoisted(() => vi.fn(async () => "novo-id"));
const patchDemandById = vi.hoisted(() => vi.fn(async () => {}));
vi.mock("@/services/demandasService/postDemand", () => ({ postDemand }));
vi.mock("@/services/demandasService/patchDemandById", () => ({ patchDemandById }));
vi.mock("@/services/demandasService/deleteDemandById", () => ({ deleteDemandById: vi.fn() }));
vi.mock("@/services/demandasService/postDemandRestore", () => ({ postDemandRestore: vi.fn() }));

import { revalidatePath } from "next/cache";
import { createDemand, deleteDemand, quickCreateDemand, updateDemand } from "../demandActions";

const form = {
  title: "Enviar proposta",
  day: "hoje" as const,
  date: null,
  time: "18:00",
  prio: "media" as const,
  requester: "",
  projectId: null,
  company: null,
  dept: null,
};

describe("demandActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("createDemand valida antes de tocar no banco", async () => {
    expect(await createDemand({ ...form, title: "" })).toEqual({ ok: false, error: "escreve pelo menos o que é, né." });
    expect(postDemand).not.toHaveBeenCalled();
  });

  it("createDemand calcula o prazo no fuso do usuário e invalida as telas", async () => {
    expect(await createDemand(form)).toEqual({ ok: true, id: "novo-id" });
    const [{ due }] = postDemand.mock.calls[0] as unknown as [{ due: number }];
    expect(new Date(due).getUTCHours()).toBe(21); // 18:00 em SP
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("quickCreateDemand usa fim do expediente e prioridade média", async () => {
    await quickCreateDemand("  ligar pro Paulo ");
    expect(postDemand).toHaveBeenCalledWith(
      expect.objectContaining({ title: "ligar pro Paulo", prio: "media", projectId: null }),
    );
  });

  it("erro no banco vira mensagem amigável", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    postDemand.mockRejectedValueOnce(new Error("boom"));
    expect(await createDemand(form)).toEqual({ ok: false, error: "deu ruim. tenta de novo?" });
  });

  it("updateDemand recusa id que não é uuid", async () => {
    expect((await updateDemand("1; drop table", { title: "x" })).ok).toBe(false);
    expect(patchDemandById).not.toHaveBeenCalled();
  });

  it("updateDemand recusa campo inválido", async () => {
    const id = "00000000-0000-4000-8000-000000000001";
    expect((await updateDemand(id, { prio: "absurda" as never })).ok).toBe(false);
    expect((await updateDemand(id, { status: "done" })).ok).toBe(true);
  });

  it("deleteDemand recusa id inválido", async () => {
    expect((await deleteDemand("nope")).ok).toBe(false);
  });
});
