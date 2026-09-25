import type { ProjectDTO } from "@/lib/demand";
import { Chip, ChipScroller } from "./Chip";

interface ProjectChipsProps {
  projects: ProjectDTO[];
  value: string | null;
  onChange: (id: string | null) => void;
}

export function ProjectChips({ projects, value, onChange }: ProjectChipsProps) {
  return (
    <ChipScroller label="projeto">
      {projects.map((p) => (
        <OptionChip key={p.id} value={p.id} label={p.name.toLowerCase()} active={value === p.id} onSelect={onChange} />
      ))}
      {projects.length === 0 && <span className="text-[13px] text-neutral-500">crie em projetos</span>}
    </ChipScroller>
  );
}

interface OptionalChipsProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (v: T | null) => void;
}

/** Tocar de novo no chip ativo desmarca. */
export function OptionalChips<T extends string>({ label, options, value, onChange }: OptionalChipsProps<T>) {
  function handleSelect(v: T) {
    onChange(value === v ? null : v);
  }
  return (
    <ChipScroller label={label}>
      {options.map((o) => (
        <OptionChip key={o} value={o} label={o} active={value === o} onSelect={handleSelect} />
      ))}
    </ChipScroller>
  );
}

interface OptionChipProps<T> {
  value: T;
  label: string;
  active: boolean;
  onSelect: (v: T) => void;
}

function OptionChip<T>({ value, label, active, onSelect }: OptionChipProps<T>) {
  function handleClickOptionChip() {
    onSelect(value);
  }
  return (
    <Chip variant="option" active={active} onClick={handleClickOptionChip}>
      {label}
    </Chip>
  );
}
