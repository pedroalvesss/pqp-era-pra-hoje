import "server-only";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { PROJECT_COLORS } from "@/lib/constants";
import { getCurrentUser } from "../authService/getCurrentUser";

/** A cor segue a rotação da paleta de projetos. */
export async function postProject(name: string) {
  const { id: userId } = await getCurrentUser();
  const [{ total }] = await db.select({ total: count() }).from(projects).where(eq(projects.userId, userId));
  await db.insert(projects).values({ userId, name, color: PROJECT_COLORS[total % PROJECT_COLORS.length] });
}
