interface SwitchProps {
  checked: boolean;
  label: string;
  disabled?: boolean;
  onToggle: () => void;
}

export function Switch({ checked, label, disabled, onToggle }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={`relative h-7 w-[46px] flex-none rounded-[14px] border-none p-0 transition-colors ${checked ? "bg-accent" : "bg-neutral-800"}`}
    >
      <span
        className={`absolute top-[3px] left-[3px] size-[22px] rounded-full bg-neutral-100 transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0"}`}
      />
    </button>
  );
}
