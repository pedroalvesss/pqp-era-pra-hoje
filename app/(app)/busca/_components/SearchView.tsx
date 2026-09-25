"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { usePathname } from "next/navigation";
import { XIcon } from "@phosphor-icons/react";
import { DemandRow } from "@/components/DemandRow";
import { matchesQuery, sortDemands, type DemandDTO, type ProjectDTO } from "@/lib/demand";
import { useRecentSearches } from "../_hooks/useRecentSearches";
import { RecentChips } from "./RecentChips";

interface SearchViewProps {
  demands: DemandDTO[];
  projects: ProjectDTO[];
  initialQuery: string;
}

export function SearchView({ demands, projects, initialQuery }: SearchViewProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState(initialQuery);
  const { recent, remember } = useRecentSearches();
  const q = query.trim();
  const results = q ? sortDemands(demands).filter((d) => matchesQuery(d, projects, q)) : [];

  // a busca fica na URL (sem ida ao servidor) e vira "recente" quando acha algo
  useEffect(() => {
    const id = setTimeout(() => {
      window.history.replaceState(null, "", q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname);
      if (results.length) remember(q);
    }, 600);
    return () => clearTimeout(id);
  }, [q, results.length, pathname, remember]);

  function handleChangeQueryInput(e: ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }
  function handleClickClearButton() {
    setQuery("");
  }

  return (
    <>
      <div className="border-divider flex items-center gap-2.5 border-b">
        <input
          autoFocus
          type="search"
          aria-label="procurar"
          value={query}
          onChange={handleChangeQueryInput}
          placeholder="procurar…"
          className="text-text h-16 min-w-0 flex-1 border-none bg-transparent text-[34px] font-medium tracking-[-0.04em] outline-none md:text-[46px] [&::-webkit-search-cancel-button]:hidden"
        />
        {q && (
          <button
            onClick={handleClickClearButton}
            aria-label="Limpar"
            className="btn btn-icon text-lg text-neutral-400"
          >
            <XIcon />
          </button>
        )}
      </div>
      {!q && <RecentChips recent={recent} onPick={setQuery} />}
      {results.length > 0 && (
        <div className="-mt-3 flex flex-col">
          {results.map((d) => (
            <DemandRow key={d.id} demand={d} projects={projects} />
          ))}
        </div>
      )}
      {q && results.length === 0 && (
        <p className="-mt-3 mb-0 px-3 text-[15px] text-neutral-400">nada com &quot;{q}&quot;. nem no papel.</p>
      )}
    </>
  );
}
