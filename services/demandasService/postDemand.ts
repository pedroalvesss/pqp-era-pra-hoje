import "server-only";
import { db } from "@/db";
import { demands } from "@/db/schema";
import type { Company, Dept, Prio } from "@/lib/constants";
import { getCurrentUser } from "../authService/getCurrentUser";
import { assertProjectOwner } from "./assertProjectOwner";

export interface NewDemand {
  title: string;
  due: number;
  prio: Prio;
  requester: string;
  projectId: string | null;
  company: Company | null;
  dept: Dept | null;
}

export async function postDemand(input: NewDemand) {
  const { id: userId } = await getCurrentUser();
  await assertProjectOwner(userId, input.projectId);
  const [row] = await db
    .insert(demands)
    .values({ ...input, userId, due: new Date(input.due) })
    .returning({ id: demands.id });
  return row.id;
}
