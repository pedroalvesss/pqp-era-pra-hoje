import { LEAD_MINUTES, type Lead } from "./constants";
import { zonedParts } from "./dates";

export function reminderText(title: string, minutesLeft: number) {
  const m = Math.max(1, Math.round(minutesLeft));
  const left = m <= 90 ? `${m} min` : m < 36 * 60 ? `${Math.round(m / 60)} h` : `${Math.round(m / 1440)} dias`;
  const verb = left.startsWith("1 ") ? "Falta" : "Faltam";
  return `${verb} ${left} pra "${title}". Não é pânico, é lembrete.`;
}

/** Já tá na hora de avisar? Ignora o que venceu há mais de 1h pra não mandar aviso velho. */
export function shouldRemind(due: number, lead: Lead, now: number) {
  return due - LEAD_MINUTES[lead] * 60000 <= now && due > now - 3600000;
}

export function lateText(title: string, daysLate: number) {
  const when = daysLate === 1 ? "era pra ontem" : `venceu há ${daysLate} dias`;
  return `"${title}" ${when}. Ainda dá pra fingir que foi hoje.`;
}

export function waitingText(title: string, requester: string, days: number) {
  const who = requester.trim();
  return who
    ? `Você tá esperando ${who} há ${days} dias em "${title}". Bora cutucar?`
    : `"${title}" tá esperando alguém há ${days} dias. Bora cutucar?`;
}

export const WAITING_DAYS = 2;
export const LATE_MAX_DAYS = 7;

/** Cutucada (atraso, espera) só de manhã em diante, no fuso do usuário: ninguém quer push de madrugada. */
export function isNudgeTime(now: number, tz: string) {
  return zonedParts(now, tz).hour >= 9;
}

/** No push o título já é a demanda: tira a menção repetida do texto. */
export function pushBody(text: string, title: string) {
  const q = `"${title}"`;
  return text.replace(` pra ${q}`, "").replace(` em ${q}`, "").replace(`${q} `, "");
}
