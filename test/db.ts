import { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/db/schema";

/** Postgres de verdade, em memória, com as mesmas migrations do deploy. Suba um por arquivo (é lento). */
export async function createTestDb() {
  const db = drizzle(new PGlite(), { schema, casing: "snake_case" });
  await migrate(db, { migrationsFolder: "db/migrations" });
  return db;
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>;

/** Zera tudo entre um teste e outro. */
export async function resetDb(db: TestDb) {
  await db.execute(
    sql`truncate users, projects, demands, notifications, push_subscriptions, password_reset_tokens cascade`,
  );
}

export async function seedUser(db: TestDb, email = "pedro@x.com") {
  const [user] = await db
    .insert(schema.users)
    .values({ email, name: "Pedro", passwordHash: "scrypt$00$00" })
    .returning({ id: schema.users.id });
  return user.id;
}
