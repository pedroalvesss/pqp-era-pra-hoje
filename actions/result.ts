import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true } | { ok: false; error: string };

export const OK: ActionResult = { ok: true };

/** Roda a mutação, invalida as telas do app e nunca deixa erro cru vazar pro client. */
export async function mutate(run: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await run();
  } catch (e) {
    console.error(e);
    return { ok: false, error: "deu ruim. tenta de novo?" };
  }
  revalidatePath("/", "layout");
  return OK;
}
