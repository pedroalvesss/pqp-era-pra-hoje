import "server-only";
import { cache } from "react";

/** Um único "agora" por requisição: todos os Server Components enxergam o mesmo instante. */
export const getRequestNow = cache(() => Date.now());
