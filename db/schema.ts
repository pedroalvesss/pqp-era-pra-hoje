import { boolean, index, pgEnum, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";
import { COMPANIES, DEPTS, LEADS, PRIOS, STATUSES } from "@/lib/constants";

export const statusEnum = pgEnum("demand_status", STATUSES);
export const prioEnum = pgEnum("demand_prio", PRIOS);
export const leadEnum = pgEnum("push_lead", LEADS);
export const companyEnum = pgEnum("company", COMPANIES);
export const deptEnum = pgEnum("dept", DEPTS);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// RLS ligado sem policy: o app conecta como dono das tabelas; a API pública do Supabase (anon) não enxerga nada
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  name: text().notNull(),
  passwordHash: text("password_hash").notNull(),
  pushEnabled: boolean("push_enabled").notNull().default(true),
  lead: leadEnum().notNull().default("1h"),
  workdayEnd: time("workday_end").notNull().default("18:00"),
  timezone: text().notNull().default("America/Sao_Paulo"),
  createdAt: createdAt(),
}).enableRLS();

export const passwordResetTokens = pgTable("password_reset_tokens", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
}).enableRLS();

export const projects = pgTable(
  "projects",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text().notNull(),
    color: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("projects_user").on(t.userId)],
).enableRLS();

export const demands = pgTable(
  "demands",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text().notNull(),
    due: timestamp({ withTimezone: true }).notNull(),
    prio: prioEnum().notNull().default("media"),
    requester: text().notNull().default(""),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    company: companyEnum(),
    dept: deptEnum(),
    status: statusEnum().notNull().default("todo"),
    prevStatus: statusEnum("prev_status"),
    notes: text().notNull().default(""),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    createdAt: createdAt(),
    doneAt: timestamp("done_at", { withTimezone: true }),
  },
  (t) => [index("demands_user_due").on(t.userId, t.due)],
).enableRLS();

export const notifications = pgTable(
  "notifications",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    demandId: uuid("demand_id").references(() => demands.id, { onDelete: "set null" }),
    text: text().notNull(),
    createdAt: createdAt(),
    readAt: timestamp("read_at", { withTimezone: true }),
  },
  (t) => [index("notifications_user_created").on(t.userId, t.createdAt)],
).enableRLS();

// uma por aparelho (PC + celular)
export const pushSubscriptions = pgTable("push_subscriptions", {
  endpoint: text().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  p256dh: text().notNull(),
  auth: text().notNull(),
  createdAt: createdAt(),
}).enableRLS();
