"use server";

import { firstError, projectSchema } from "@/lib/schemas";
import { postProject } from "@/services/projetosService/postProject";
import { mutate, type ActionResult } from "./result";

export async function createProject(name: string): Promise<ActionResult> {
  const parsed = projectSchema.safeParse({ name });
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  return mutate(() => postProject(parsed.data.name));
}
