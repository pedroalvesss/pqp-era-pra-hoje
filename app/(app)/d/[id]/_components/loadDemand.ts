import "server-only";
import { notFound } from "next/navigation";
import { idSchema } from "@/lib/schemas";
import { getDemandById } from "@/services/demandasService/getDemandById";
import { getProjects } from "@/services/projetosService/getProjects";

/** Usado pela página cheia e pelo drawer interceptado. */
export async function loadDemand(id: string) {
  if (!idSchema.safeParse(id).success) notFound();
  const [demand, projects] = await Promise.all([getDemandById(id), getProjects()]);
  if (!demand) notFound();
  return { demand, projects };
}
