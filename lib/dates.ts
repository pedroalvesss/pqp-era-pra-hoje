import type { DayChoice } from "./constants";

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
}

const DAY_MS = 864e5;
const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(tz: string) {
  let f = formatters.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      weekday: "short",
    });
    formatters.set(tz, f);
  }
  return f;
}

export function isValidTimeZone(tz: string) {
  try {
    formatterFor(tz);
    return true;
  } catch {
    return false;
  }
}

export function zonedParts(ts: number, tz: string): ZonedParts {
  const p = Object.fromEntries(
    formatterFor(tz)
      .formatToParts(ts)
      .map((x) => [x.type, x.value]),
  );
  return {
    year: +p.year,
    month: +p.month,
    day: +p.day,
    hour: +p.hour,
    minute: +p.minute,
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday),
  };
}

function dayIndex(ts: number, tz: string) {
  const p = zonedParts(ts, tz);
  return Date.UTC(p.year, p.month - 1, p.day) / DAY_MS;
}

export function dayDiff(ts: number, now: number, tz: string) {
  return dayIndex(ts, tz) - dayIndex(now, tz);
}

const pad = (n: number) => String(n).padStart(2, "0");

export function hm(ts: number, tz: string) {
  const p = zonedParts(ts, tz);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export function isoDate(ts: number, tz: string) {
  const p = zonedParts(ts, tz);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Converte data/hora "de parede" no fuso `tz` para timestamp UTC. */
export function zonedTime(year: number, month: number, day: number, hour: number, minute: number, tz: string) {
  const wall = Date.UTC(year, month - 1, day, hour, minute);
  const offsetAt = (ts: number) => {
    const p = zonedParts(ts, tz);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - ts;
  };
  const guess = wall - offsetAt(wall);
  // segunda passada acerta quando o palpite cai do outro lado de uma troca de horário de verão
  return wall - offsetAt(guess);
}

export function parseHm(time: string) {
  const [h, m] = time.split(":").map(Number);
  return { hour: h || 0, minute: m || 0 };
}

export function dueFrom(day: DayChoice, time: string, now: number, tz: string) {
  const p = zonedParts(now, tz);
  let add = 0;
  if (day === "amanha") add = 1;
  if (day === "sexta") add = (5 - p.weekday + 7) % 7 || 7;
  if (day === "semana") add = (1 - p.weekday + 7) % 7 || 7;
  const { hour, minute } = parseHm(time);
  return zonedTime(p.year, p.month, p.day + add, hour, minute, tz);
}

/** Troca só a data ou só a hora de um prazo, mantendo o resto. */
export function withDate(ts: number, date: string, tz: string) {
  const [y, m, d] = date.split("-").map(Number);
  const p = zonedParts(ts, tz);
  return zonedTime(y, m, d, p.hour, p.minute, tz);
}

export function withTime(ts: number, time: string, tz: string) {
  const p = zonedParts(ts, tz);
  const { hour, minute } = parseHm(time);
  return zonedTime(p.year, p.month, p.day, hour, minute, tz);
}

export function plusOneDay(ts: number, tz: string) {
  const p = zonedParts(ts, tz);
  return zonedTime(p.year, p.month, p.day + 1, p.hour, p.minute, tz);
}

export function dayName(ts: number, now: number, tz: string) {
  const dd = dayDiff(ts, now, tz);
  if (dd === 0) return "hoje";
  if (dd === 1) return "amanhã";
  if (dd === -1) return "ontem";
  if (dd > 1 && dd < 7) return WEEKDAYS_SHORT[zonedParts(ts, tz).weekday];
  if (dd < -1) return `há ${-dd} dias`;
  const p = zonedParts(ts, tz);
  return `${pad(p.day)}/${pad(p.month)}`;
}

export function greeting(now: number, tz: string) {
  const h = zonedParts(now, tz).hour;
  return h < 12 ? "bom dia" : h < 18 ? "boa tarde" : "boa noite";
}

export function calendarLeaf(now: number, tz: string) {
  const weekday = new Intl.DateTimeFormat("pt-BR", { timeZone: tz, weekday: "long" }).format(now).replace("-feira", "");
  const month = new Intl.DateTimeFormat("pt-BR", { timeZone: tz, month: "long" }).format(now);
  return { weekday, day: String(zonedParts(now, tz).day), month };
}

export function relativeAgo(ts: number, now: number, tz: string) {
  const min = Math.round((now - ts) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  if (dayDiff(ts, now, tz) === 0) return `${Math.round(min / 60)}h`;
  return dayName(ts, now, tz);
}
