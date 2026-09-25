import { describe, expect, it } from "vitest";
import { reminderText, shouldRemind } from "../reminders";
import { NOW } from "@/test/fixtures";

describe("reminderText", () => {
  it.each([
    [50, 'Faltam 50 min pra "X". Não é pânico, é lembrete.'],
    [60, 'Faltam 60 min pra "X". Não é pânico, é lembrete.'],
    [120, 'Faltam 2 h pra "X". Não é pânico, é lembrete.'],
    [1440, 'Faltam 24 h pra "X". Não é pânico, é lembrete.'],
    [2880, 'Faltam 2 dias pra "X". Não é pânico, é lembrete.'],
    [1, 'Falta 1 min pra "X". Não é pânico, é lembrete.'],
  ])("%i min", (min, text) => expect(reminderText("X", min)).toBe(text));
});

describe("shouldRemind", () => {
  const h = 3600000;
  it("avisa quando entra na antecedência", () => {
    expect(shouldRemind(NOW + 50 * 60000, "1h", NOW)).toBe(true);
    expect(shouldRemind(NOW + 2 * h, "1h", NOW)).toBe(false);
    expect(shouldRemind(NOW + 20 * h, "1d", NOW)).toBe(true);
    expect(shouldRemind(NOW + 20 * 60000, "15m", NOW)).toBe(false);
  });
  it("não manda aviso de coisa vencida há mais de 1h", () => {
    expect(shouldRemind(NOW - 30 * 60000, "15m", NOW)).toBe(true);
    expect(shouldRemind(NOW - 2 * h, "15m", NOW)).toBe(false);
  });
});
