import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChipVariant = "filter" | "option";

/** filter: chips de filtro/status. option: chips dentro dos grupos estilo iOS. */
export function chipClass(active: boolean, variant: ChipVariant = "filter") {
  const look =
    variant === "filter"
      ? active
        ? "bg-neutral-100 text-bg hover:text-bg"
        : "bg-neutral-900 text-neutral-300 hover:text-neutral-100"
      : active
        ? "bg-neutral-100 text-bg"
        : "bg-transparent text-neutral-300 shadow-[inset_0_0_0_1px_var(--color-neutral-800)]";
  const size =
    variant === "filter" ? "min-h-[34px] rounded-[10px] px-3 text-sm" : "min-h-8 rounded-[9px] px-2.5 text-[13px]";
  return cn("inline-flex flex-none items-center border-none whitespace-nowrap no-underline", size, look);
}

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  variant?: ChipVariant;
}

export function Chip({ active, variant = "filter", className, children, ...props }: ChipProps) {
  return (
    <button type="button" aria-pressed={active} className={cn(chipClass(active, variant), className)} {...props}>
      {children}
    </button>
  );
}

interface ChipScrollerProps {
  children: ReactNode;
  label: string;
}

/** Chips rolam na horizontal quando não cabem, sem quebrar linha. */
export function ChipScroller({ children, label }: ChipScrollerProps) {
  return (
    <div role="group" aria-label={label} className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto py-0.5">
      {children}
    </div>
  );
}
