import { PRIOS, PRIO_GLYPH, type Prio } from "@/lib/constants";

interface PrioPickerProps {
  value: Prio;
  onChange: (prio: Prio) => void;
}

export function PrioPicker({ value, onChange }: PrioPickerProps) {
  return (
    <div role="radiogroup" aria-label="urgência" className="flex gap-0.5">
      {PRIOS.map((p) => (
        <PrioOption key={p} prio={p} active={value === p} onSelect={onChange} />
      ))}
    </div>
  );
}

interface PrioOptionProps {
  prio: Prio;
  active: boolean;
  onSelect: (prio: Prio) => void;
}

function PrioOption({ prio, active, onSelect }: PrioOptionProps) {
  function handleClickPrioButton() {
    onSelect(prio);
  }
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      title={PRIO_GLYPH[prio].title}
      aria-label={PRIO_GLYPH[prio].title}
      onClick={handleClickPrioButton}
      className={`min-h-8 min-w-10 rounded-lg border-none px-2 text-sm font-semibold tracking-[-0.06em] ${active ? "bg-accent text-bg" : "bg-transparent text-neutral-400"}`}
    >
      {PRIO_GLYPH[prio].label}
    </button>
  );
}
