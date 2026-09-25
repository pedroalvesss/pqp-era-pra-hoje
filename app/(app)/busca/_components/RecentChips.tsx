interface RecentChipsProps {
  recent: string[];
  onPick: (query: string) => void;
}

export function RecentChips({ recent, onPick }: RecentChipsProps) {
  if (!recent.length) return null;
  return (
    <div role="group" aria-label="buscas recentes" className="-mt-3 flex flex-wrap gap-1.5">
      {recent.map((r) => (
        <RecentChip key={r} query={r} onPick={onPick} />
      ))}
    </div>
  );
}

interface RecentChipProps {
  query: string;
  onPick: (query: string) => void;
}

function RecentChip({ query, onPick }: RecentChipProps) {
  function handleClickRecentChip() {
    onPick(query);
  }
  return (
    <button
      onClick={handleClickRecentChip}
      className="bg-surface hover:text-accent min-h-[34px] rounded-[10px] border-none px-3 text-sm whitespace-nowrap text-neutral-300"
    >
      {query}
    </button>
  );
}
