import { calendarLeaf } from "@/lib/dates";

interface CalendarLeafProps {
  now: number;
  tz: string;
  today: number;
  late: number;
  done: number;
}

/** A folhinha do dia. Desktop em coluna (220px), mobile em linha com o número à esquerda. */
export function CalendarLeaf({ now, tz, today, late, done }: CalendarLeafProps) {
  const leaf = calendarLeaf(now, tz);
  return (
    <div className="text-bg w-full flex-none overflow-hidden rounded-[18px] bg-neutral-100 md:w-[220px]">
      <div aria-hidden="true" className="bg-accent flex h-5 items-center justify-between px-[30%] md:px-[26%]">
        <span className="bg-bg size-[7px] rounded-full" />
        <span className="bg-bg size-[7px] rounded-full" />
      </div>
      <div className="flex flex-row items-end gap-3.5 px-[18px] pt-3 pb-3.5 md:flex-col md:items-start md:gap-1.5">
        <span className="tabular order-0 -ml-[3px] text-[64px] leading-[.85] font-medium tracking-[-0.07em] md:order-1 md:text-[110px]">
          {leaf.day}
        </span>
        <span className="flex flex-col text-sm leading-[1.3] font-medium">
          <span>{leaf.weekday}</span>
          <span className="opacity-60">{leaf.month}</span>
        </span>
      </div>
      <div className="tabular border-bg/25 flex gap-3.5 border-t-2 border-dotted px-[18px] pt-2.5 pb-3 text-[13px] font-medium">
        <span>
          <span className="text-accent-700">{today}</span> hoje
        </span>
        <span>
          <span className="text-accent-700">{late}</span> já era
        </span>
        <span className="opacity-55">{done} feitas</span>
      </div>
    </div>
  );
}
