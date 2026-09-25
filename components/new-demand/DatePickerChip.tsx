"use client";

import { useState } from "react";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import { chipClass } from "@/components/Chip";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerChipProps {
  /** YYYY-MM-DD, ou null se ainda não escolheu. */
  value: string | null;
  active: boolean;
  onSelect: (date: string) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function fromIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "qua, 30/09" */
export function chipDateLabel(iso: string) {
  const d = fromIso(iso);
  const weekday = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  return `${weekday}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

/** Chip que abre o calendário pra escolher qualquer dia. */
export function DatePickerChip({ value, active, onSelect }: DatePickerChipProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function handleSelectDay(day: Date | undefined) {
    if (!day) return;
    onSelect(toIso(day));
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-pressed={active}
        aria-label={active && value ? `dia escolhido: ${chipDateLabel(value)}` : "escolher dia no calendário"}
        className={cn(chipClass(active, "option"), "gap-1.5")}
      >
        <CalendarBlankIcon size={15} />
        {active && value ? chipDateLabel(value) : "outro dia"}
      </PopoverTrigger>
      <PopoverContent align="end">
        <Calendar
          mode="single"
          autoFocus
          selected={value ? fromIso(value) : undefined}
          defaultMonth={value ? fromIso(value) : today}
          disabled={{ before: today }}
          onSelect={handleSelectDay}
        />
      </PopoverContent>
    </Popover>
  );
}
