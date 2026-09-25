import { describe, expect, it } from "vitest";
import {
  calendarLeaf,
  dayDiff,
  dayName,
  dueFrom,
  greeting,
  hm,
  isValidTimeZone,
  isoDate,
  plusOneDay,
  relativeAgo,
  withDate,
  withTime,
  zonedTime,
} from "../dates";
import { DAY, MIN, NOW, TZ } from "@/test/fixtures";

describe("zonedTime", () => {
  it("converte hora de parede de São Paulo pra UTC", () => {
    expect(zonedTime(2026, 9, 24, 18, 0, TZ)).toBe(Date.UTC(2026, 8, 24, 21, 0));
  });

  it("respeita horário de verão em outro fuso", () => {
    expect(zonedTime(2026, 7, 1, 9, 0, "America/New_York")).toBe(Date.UTC(2026, 6, 1, 13, 0));
    expect(zonedTime(2026, 1, 1, 9, 0, "America/New_York")).toBe(Date.UTC(2026, 0, 1, 14, 0));
  });
});

describe("dueFrom", () => {
  it("hoje no horário pedido", () => {
    expect(dueFrom("hoje", "18:00", NOW, TZ)).toBe(Date.UTC(2026, 8, 24, 21, 0));
  });
  it("amanhã", () => {
    expect(isoDate(dueFrom("amanha", "09:30", NOW, TZ), TZ)).toBe("2026-09-25");
  });
  it("sexta é a próxima sexta (hoje é quinta)", () => {
    expect(isoDate(dueFrom("sexta", "18:00", NOW, TZ), TZ)).toBe("2026-09-25");
  });
  it("sexta numa sexta pula pra semana seguinte", () => {
    expect(isoDate(dueFrom("sexta", "18:00", NOW + DAY, TZ), TZ)).toBe("2026-10-02");
  });
  it("semana que vem é a próxima segunda", () => {
    expect(isoDate(dueFrom("semana", "18:00", NOW, TZ), TZ)).toBe("2026-09-28");
  });
});

describe("dayDiff e dayName", () => {
  it("usa o dia do fuso, não o de UTC", () => {
    // 23:30 em SP ainda é hoje, mesmo já sendo amanhã em UTC
    const lateNight = Date.UTC(2026, 8, 25, 2, 30);
    expect(dayDiff(lateNight, NOW, TZ)).toBe(0);
  });
  it.each([
    [0, "hoje"],
    [1, "amanhã"],
    [-1, "ontem"],
    [-3, "há 3 dias"],
    [2, "sáb"],
    [8, "02/10"],
  ])("%i dias → %s", (days, label) => {
    expect(dayName(NOW + days * DAY, NOW, TZ)).toBe(label);
  });
});

describe("edição de prazo", () => {
  const due = Date.UTC(2026, 8, 24, 21, 0); // 18:00 SP
  it("troca só a data", () => expect(hm(withDate(due, "2026-10-01", TZ), TZ)).toBe("18:00"));
  it("troca só a hora", () => expect(isoDate(withTime(due, "08:15", TZ), TZ)).toBe("2026-09-24"));
  it("joga pra amanhã mantendo a hora", () => {
    const next = plusOneDay(due, TZ);
    expect([isoDate(next, TZ), hm(next, TZ)]).toEqual(["2026-09-25", "18:00"]);
  });
});

describe("textos", () => {
  it("saudação por hora", () => {
    expect(greeting(NOW, TZ)).toBe("boa tarde");
    expect(greeting(NOW - 5 * 60 * MIN, TZ)).toBe("bom dia");
    expect(greeting(NOW + 5 * 60 * MIN, TZ)).toBe("boa noite");
  });
  it("folhinha em pt-BR sem '-feira'", () => {
    expect(calendarLeaf(NOW, TZ)).toEqual({ weekday: "quinta", day: "24", month: "setembro" });
  });
  it("tempo relativo dos avisos", () => {
    expect(relativeAgo(NOW, NOW, TZ)).toBe("agora");
    expect(relativeAgo(NOW - 12 * MIN, NOW, TZ)).toBe("12 min");
    expect(relativeAgo(NOW - 3 * 60 * MIN, NOW, TZ)).toBe("3h");
    expect(relativeAgo(NOW - DAY, NOW, TZ)).toBe("ontem");
  });
  it("valida fuso", () => {
    expect(isValidTimeZone(TZ)).toBe(true);
    expect(isValidTimeZone("Marte/Base")).toBe(false);
  });
});
