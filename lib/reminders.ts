import { LEAD_MINUTES, type Lead } from "./constants";

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
