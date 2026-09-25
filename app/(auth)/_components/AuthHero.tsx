import { Lockup } from "@/components/Logo";
import { calendarLeaf } from "@/lib/dates";
import { DEFAULT_TZ } from "@/lib/constants";

interface AuthHeroProps {
  now: number;
}

/** Coluna da esquerda no desktop: folhinha grande torta + frase. */
export function AuthHero({ now }: AuthHeroProps) {
  const leaf = calendarLeaf(now, DEFAULT_TZ);
  return (
    <div className="hidden flex-[1.1] flex-col justify-between gap-10 px-14 py-10 md:flex">
      <Lockup markSize={30} textSize={16} />
      <div className="flex flex-wrap items-end gap-10">
        <div
          aria-hidden="true"
          className="text-bg w-[260px] -rotate-3 overflow-hidden rounded-[22px] bg-neutral-100 shadow-[0_30px_60px_rgba(0,0,0,.45)]"
        >
          <div className="bg-accent flex h-[34px] items-center justify-between px-16">
            <span className="bg-bg size-2.5 rounded-full" />
            <span className="bg-bg size-2.5 rounded-full" />
          </div>
          <div className="flex flex-col px-6 pt-[18px] pb-2">
            <span className="text-base font-medium">{leaf.weekday}</span>
            <span className="tabular -ml-1.5 text-[150px] leading-[.85] font-medium tracking-[-0.07em]">
              {leaf.day}
            </span>
            <span className="text-base font-medium">{leaf.month}</span>
          </div>
          <div className="border-bg/30 text-accent-700 mt-3.5 border-t-2 border-dotted px-6 pt-3.5 pb-[18px] text-[22px] font-semibold tracking-[-0.03em]">
            era pra hoje?
          </div>
        </div>
        <h1 className="m-0 max-w-[360px] text-[52px] leading-none font-medium tracking-[-0.045em]">
          o caderninho que não esquece.
        </h1>
      </div>
      <span className="text-[13px] text-neutral-500">diferente de você.</span>
    </div>
  );
}
