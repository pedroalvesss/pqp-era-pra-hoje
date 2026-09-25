import { describe, expect, it } from "vitest";
import {
  createDemandSchema,
  firstError,
  loginSchema,
  prefsSchema,
  registerSchema,
  updateDemandSchema,
} from "../schemas";

function errorOf(result: { success: boolean; error?: Parameters<typeof firstError>[0] }) {
  return result.success ? null : firstError(result.error!);
}

describe("auth", () => {
  it("mensagens do design", () => {
    expect(errorOf(loginSchema.safeParse({ email: "x", password: "123456" }))).toBe("esse e-mail tá estranho.");
    expect(errorOf(loginSchema.safeParse({ email: "a@b.co", password: "123" }))).toBe(
      "senha com pelo menos 6 caracteres.",
    );
  });

  const base = { name: "Pedro", email: "a@b.co", password: "123456", password2: "123456", timezone: "America/Belem" };
  it("cadastro válido", () => expect(registerSchema.safeParse(base).success).toBe(true));
  it("nome vazio", () =>
    expect(errorOf(registerSchema.safeParse({ ...base, name: " " }))).toBe("fala seu nome, pelo menos."));
  it("senhas diferentes", () =>
    expect(errorOf(registerSchema.safeParse({ ...base, password2: "654321" }))).toBe("as senhas não bateram."));
  it("fuso inválido cai no padrão", () => {
    const r = registerSchema.safeParse({ ...base, timezone: "Marte/Base" });
    expect(r.success && r.data.timezone).toBe("America/Sao_Paulo");
  });
});

describe("demanda", () => {
  const valid = {
    title: "Enviar proposta",
    day: "hoje",
    date: null,
    time: "18:00",
    prio: "alta",
    requester: "",
    projectId: null,
    company: "Neobiz",
    dept: null,
  };
  it("aceita o formulário", () => expect(createDemandSchema.safeParse(valid).success).toBe(true));
  it("título vazio", () =>
    expect(errorOf(createDemandSchema.safeParse({ ...valid, title: "   " }))).toBe("escreve pelo menos o que é, né."));
  it("rejeita empresa fora da lista", () =>
    expect(createDemandSchema.safeParse({ ...valid, company: "Acme" }).success).toBe(false));
  it("rejeita hora inválida", () =>
    expect(createDemandSchema.safeParse({ ...valid, time: "25:00" }).success).toBe(false));
  it("dia do calendário exige a data", () => {
    expect(errorOf(createDemandSchema.safeParse({ ...valid, day: "data" }))).toBe("escolhe o dia no calendário.");
    expect(createDemandSchema.safeParse({ ...valid, day: "data", date: "2026-10-15" }).success).toBe(true);
    expect(createDemandSchema.safeParse({ ...valid, day: "data", date: "15/10/2026" }).success).toBe(false);
  });
  it("update parcial", () => {
    expect(updateDemandSchema.safeParse({ status: "done" }).success).toBe(true);
    expect(updateDemandSchema.safeParse({ status: "arquivada" }).success).toBe(false);
  });
});

it("prefs", () => {
  expect(prefsSchema.safeParse({ lead: "1d" }).success).toBe(true);
  expect(prefsSchema.safeParse({ lead: "2h" }).success).toBe(false);
});
