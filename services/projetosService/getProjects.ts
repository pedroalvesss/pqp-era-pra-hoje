import "server-only";
import { cache } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import type { ProjectDTO } from "@/lib/demand";
import { getCurrentUser } from "../authService/getCurrentUser";

export const getProjects = cache(async (): Promise<ProjectDTO[]> => {
  const { id } = await getCurrentUser();
  return db
    .select({ id: projects.id, name: projects.name, color: projects.color })
    .from(projects)
    .where(eq(projects.userId, id))
    .orderBy(asc(projects.createdAt));
});
