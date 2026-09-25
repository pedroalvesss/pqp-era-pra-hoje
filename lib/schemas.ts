import { z } from "zod";
import { COMPANIES, DAY_CHOICES, DEPTS, LEADS, PRIOS, STATUSES } from "./constants";
import { isValidTimeZone } from "./dates";

const email = z.email("esse e-mail tá estranho.");
const password = z.string().min(6, "senha com pelo menos 6 caracteres.");
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "hora inválida.");

const samePasswords: [(v: { password: string; password2: string }) => boolean, { message: string; path: string[] }] = [
  (v) => v.password === v.password2,
  { message: "as senhas não bateram.", path: ["password2"] },
];

export const loginSchema = z.object({ email, password });
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email });

const registerFields = z.object({
  name: z.string().trim().min(1, "fala seu nome, pelo menos.").max(60),
  email,
  password,
  password2: z.string(),
});

/** O que o formulário valida. */
export const registerFormSchema = registerFields.refine(...samePasswords);
export type RegisterInput = z.infer<typeof registerFormSchema>;

/** O que a action valida: o form + o fuso do aparelho. */
export const registerSchema = registerFields
  .extend({ timezone: z.string().refine(isValidTimeZone).catch("America/Sao_Paulo") })
  .refine(...samePasswords);

export const resetPasswordSchema = z.object({ password, password2: z.string() }).refine(...samePasswords);
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

const optionalProject = z.uuid().nullable();

const title = z.string().trim().min(1, "escreve pelo menos o que é, né.").max(300);

export const createDemandSchema = z
  .object({
    title,
    day: z.enum([...DAY_CHOICES, "data"]),
    date: z.iso.date().nullable(),
    time,
    prio: z.enum(PRIOS),
    requester: z.string().trim().max(80),
    projectId: optionalProject,
    company: z.enum(COMPANIES).nullable(),
    dept: z.enum(DEPTS).nullable(),
  })
  .refine((v) => v.day !== "data" || !!v.date, { message: "escolhe o dia no calendário.", path: ["date"] });
export type CreateDemandInput = z.infer<typeof createDemandSchema>;

export const quickDemandSchema = z.object({ title });

export const updateDemandSchema = z
  .object({
    title: title,
    due: z.number().int().positive(),
    prio: z.enum(PRIOS),
    requester: z.string().trim().max(80),
    projectId: optionalProject,
    company: z.enum(COMPANIES).nullable(),
    dept: z.enum(DEPTS).nullable(),
    status: z.enum(STATUSES),
    notes: z.string().max(5000),
  })
  .partial();
export type UpdateDemandInput = z.infer<typeof updateDemandSchema>;

export const idSchema = z.uuid();

export const demandSnapshotSchema = z.object({
  id: idSchema,
  title: title,
  due: z.number().int().positive(),
  prio: z.enum(PRIOS),
  requester: z.string().max(80),
  projectId: optionalProject,
  company: z.enum(COMPANIES).nullable(),
  dept: z.enum(DEPTS).nullable(),
  status: z.enum(STATUSES),
  prevStatus: z.enum(STATUSES).nullable(),
  notes: z.string().max(5000),
});

export const projectSchema = z.object({ name: z.string().trim().min(1, "dá um nome, né.").max(60) });

export const prefsSchema = z.object({ pushEnabled: z.boolean(), lead: z.enum(LEADS), workdayEnd: time }).partial();
export type PrefsInput = z.infer<typeof prefsSchema>;

export const pushSubscriptionSchema = z.object({
  endpoint: z.url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "algo deu errado.";
}
