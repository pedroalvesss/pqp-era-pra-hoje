export const STATUSES = ["todo", "doing", "waiting", "done"] as const;
export type Status = (typeof STATUSES)[number];

export const PRIOS = ["baixa", "media", "alta", "urgente"] as const;
export type Prio = (typeof PRIOS)[number];

export const COMPANIES = ["Deskcorp", "ITSS", "Corebanx", "Neobiz"] as const;
export type Company = (typeof COMPANIES)[number];

export const DEPTS = ["arquitetura", "QA", "plataforma e integração", "governança", "gestão", "pessoal"] as const;
export type Dept = (typeof DEPTS)[number];

export const LEADS = ["15m", "1h", "1d"] as const;
export type Lead = (typeof LEADS)[number];

export const DAY_CHOICES = ["hoje", "amanha", "sexta", "semana"] as const;
export type DayChoice = (typeof DAY_CHOICES)[number];

export const STATUS_LABEL: Record<Status, string> = {
  todo: "a fazer",
  doing: "fazendo",
  waiting: "esperando",
  done: "feito",
};

export const PRIO_GLYPH: Record<Prio, { glyph: string; label: string; title: string }> = {
  baixa: { glyph: "", label: "—", title: "baixa" },
  media: { glyph: "!", label: "!", title: "média" },
  alta: { glyph: "!!", label: "!!", title: "alta" },
  urgente: { glyph: "!!!", label: "!!!", title: "urgente" },
};

export const LEAD_LABEL: Record<Lead, string> = { "15m": "15 min", "1h": "1 h", "1d": "1 dia" };
export const LEAD_MINUTES: Record<Lead, number> = { "15m": 15, "1h": 60, "1d": 1440 };

export const DAY_LABEL: Record<DayChoice, string> = {
  hoje: "hoje",
  amanha: "amanhã",
  sexta: "sexta",
  semana: "semana que vem",
};

export const PROJECT_COLORS = [
  "oklch(0.70 0.17 35)",
  "oklch(0.80 0.13 80)",
  "oklch(0.73 0.09 230)",
  "oklch(0.76 0.12 160)",
  "oklch(0.74 0.12 320)",
] as const;

export const DONE_LINES = ["uma a menos. respira.", "feito. nem doeu.", "riscado. comemora baixinho."];

export const DEFAULT_TZ = "America/Sao_Paulo";
