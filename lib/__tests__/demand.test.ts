import { describe, expect, it } from "vitest";
import {
  demandMeta,
  describeWhen,
  groupForHome,
  heroLine,
  matchesQuery,
  nextStatus,
  projectLabel,
  sortDemands,
} from "../demand";
import { DAY, MIN, NOW, TZ, demand, projects } from "@/test/fixtures";

describe("describeWhen", () => {
  it("faltando até 90 min mostra 'em X min'", () => {
    expect(describeWhen({ due: NOW + 50 * MIN, status: "todo" }, NOW, TZ)).toEqual({
      top: "em 50 min",
      time: "14:50",
      tone: "today",
    });
  });
  it("mais tarde hoje mostra 'hoje'", () => {
    expect(describeWhen({ due: NOW + 3 * 60 * MIN, status: "todo" }, NOW, TZ).top).toBe("hoje");
  });
  it("vencida hoje mostra 'venceu'", () => {
    expect(describeWhen({ due: NOW - 10 * MIN, status: "doing" }, NOW, TZ)).toMatchObject({
      top: "venceu",
      tone: "late",
    });
  });
  it("vencida ontem mostra 'ontem'", () => {
    expect(describeWhen({ due: NOW - DAY, status: "todo" }, NOW, TZ)).toMatchObject({ top: "ontem", tone: "late" });
  });
  it("feita ganha de tudo", () => {
    expect(describeWhen({ due: NOW - DAY, status: "done" }, NOW, TZ)).toMatchObject({ top: "feito", tone: "done" });
  });
  it("futura", () => {
    expect(describeWhen({ due: NOW + DAY, status: "todo" }, NOW, TZ)).toMatchObject({ top: "amanhã", tone: "future" });
  });
});

describe("heroLine", () => {
  it.each([
    [3, 2, "3 vencem hoje. 2 já era."],
    [1, 0, "1 vence hoje. bora."],
    [0, 2, "2 já era. o resto tá em dia."],
    [0, 0, "relaxa, hoje tá tranquilo."],
  ])("%i hoje, %i atrasadas", (today, late, line) => expect(heroLine(today, late)).toBe(line));
});

describe("groupForHome", () => {
  it("separa já era, hoje, depois (7 dias) e conta feitas de hoje", () => {
    const late = demand({ due: NOW - DAY });
    const today = demand({ due: NOW + 60 * MIN });
    const soon = demand({ due: NOW + 3 * DAY });
    const far = demand({ due: NOW + 10 * DAY });
    const done = demand({ due: NOW - 60 * MIN, status: "done" });
    const g = groupForHome([far, soon, today, late, done], NOW, TZ);
    expect(g.late).toEqual([late]);
    expect(g.today).toEqual([today]);
    expect(g.upcoming).toEqual([soon]);
    expect(g.todayDone).toBe(1);
  });
});

it("sortDemands: abertas por prazo, feitas no fim", () => {
  const a = demand({ due: NOW + 2 * DAY });
  const b = demand({ due: NOW + DAY });
  const c = demand({ due: NOW, status: "done" });
  expect(sortDemands([c, a, b])).toEqual([b, a, c]);
});

describe("meta e busca", () => {
  const d = demand({ company: "Neobiz", requester: "Carla", status: "doing", notes: "cláusula de rescisão" });
  it("meta com empresa, projeto e quem pediu", () => {
    expect(demandMeta(d, projects)).toBe("Neobiz · marketing · Carla");
    expect(demandMeta(d, projects, true)).toBe("fazendo · Neobiz · marketing · Carla");
  });
  it("sem projeto", () => expect(projectLabel(projects, null)).toBe("sem projeto"));
  it.each(["neobiz", "carla", "rescis", "MARKETING"])("acha por %s", (q) =>
    expect(matchesQuery(d, projects, q)).toBe(true),
  );
  it("busca vazia não acha nada", () => expect(matchesQuery(d, projects, "  ")).toBe(false));
});

it("nextStatus avança e para em feito", () => {
  expect(nextStatus("todo")).toBe("doing");
  expect(nextStatus("waiting")).toBe("done");
  expect(nextStatus("done")).toBe("done");
});
