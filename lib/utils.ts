export { cn } from "cn";

/** Tira as chaves `undefined` pra um update parcial não zerar coluna. */
export function withoutUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}
