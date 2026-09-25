"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "pqp:buscas";
const MAX = 5;
const listeners = new Set<() => void>();

function read(): string {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Buscas recentes ficam só neste aparelho: é estado de interface, nada sensível. */
export function useRecentSearches() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const recent: string[] = JSON.parse(raw);

  const remember = useCallback((query: string) => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return;
    const next = [q, ...JSON.parse(read()).filter((x: string) => x !== q)].slice(0, MAX);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      return;
    }
    listeners.forEach((l) => l());
  }, []);

  return { recent, remember };
}
