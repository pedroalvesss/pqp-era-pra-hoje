type Response = { data?: unknown; error?: unknown; count?: number };

export interface RecordedQuery {
  table: string;
  chain: [string, unknown[]][];
}

/** Supabase de mentira: cada `.from()` consome a próxima resposta da fila e grava a cadeia de chamadas. */
export function fakeSupabase(responses: Response[] = []) {
  const queries: RecordedQuery[] = [];
  const client = {
    from(table: string) {
      const query: RecordedQuery = { table, chain: [] };
      queries.push(query);
      const response = { data: null, error: null, ...(responses.shift() ?? {}) };
      const builder: unknown = new Proxy(
        {},
        {
          get(_, prop: string) {
            if (prop === "then") return (ok: (v: unknown) => unknown) => Promise.resolve(response).then(ok);
            return (...args: unknown[]) => {
              query.chain.push([prop, args]);
              return builder;
            };
          },
        },
      );
      return builder;
    },
  };
  return { client, queries };
}

export function callOf(q: RecordedQuery, method: string) {
  return q.chain.find(([m]) => m === method)?.[1];
}
