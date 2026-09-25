"use client";

import * as React from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { DayPicker, type ChevronProps } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { cn } from "@/lib/utils";

function CalendarChevron({ orientation }: ChevronProps) {
  return orientation === "left" ? <CaretLeftIcon size={16} /> : <CaretRightIcon size={16} />;
}

const navButton =
  "grid size-9 place-items-center rounded-[9px] border-none bg-transparent p-0 text-neutral-400 hover:bg-text/5 hover:text-text disabled:opacity-30";

/** Calendário do shadcn (react-day-picker) com as cores e raios do app, em pt-BR. */
function Calendar({ className, classNames, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays
      className={cn("p-1", className)}
      classNames={{
        months: "relative flex flex-col",
        month: "flex flex-col gap-3",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: navButton,
        button_next: navButton,
        month_caption: "flex h-9 items-center justify-center",
        caption_label: "text-sm font-medium lowercase",
        month_grid: "border-collapse",
        weekdays: "flex",
        weekday: "w-10 text-center text-[11px] font-normal lowercase text-neutral-500",
        week: "mt-1 flex",
        day: "size-10 p-0 text-center",
        day_button:
          "tabular size-10 rounded-[9px] border-none bg-transparent text-sm text-text hover:bg-text/5 disabled:pointer-events-none",
        today: "[&>button]:text-accent [&>button]:font-semibold",
        selected: "[&>button]:bg-neutral-100 [&>button]:text-bg [&>button]:hover:bg-neutral-100",
        outside: "[&>button]:text-neutral-700",
        disabled: "[&>button]:opacity-30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{ Chevron: CalendarChevron }}
      {...props}
    />
  );
}

export { Calendar };
