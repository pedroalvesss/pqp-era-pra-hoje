import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";

/** Impede pendurar uma demanda no projeto de outra pessoa. */
export async function assertProjectOwner(userId: string, projectId: string | null | undefined) {
  if (!projectId) return;
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)));
  if (!row) throw new Error("projeto não encontrado");
}
