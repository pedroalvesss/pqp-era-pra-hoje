"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNewDemand } from "@/contexts/NewDemandContext";
import { NAV_ITEMS, isActive, type NavItem } from "./navItems";

const LEFT = NAV_ITEMS.slice(0, 2);
const RIGHT = NAV_ITEMS.slice(2, 4);

export function TabBar() {
  const pathname = usePathname();
  const { openNewDemand } = useNewDemand();

  function handleClickNewButton() {
    openNewDemand();
  }

  return (
    <nav
      aria-label="principal"
      className="flex flex-none items-center px-2 pt-1.5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[inset_0_1px_0_var(--color-neutral-900)] md:hidden"
    >
      {LEFT.map((item) => (
        <Tab key={item.href} item={item} active={isActive(pathname, item.href)} />
      ))}
      {/* o "+" é uma folhinha de calendário */}
      <button
        onClick={handleClickNewButton}
        aria-label="Nova demanda"
        className="text-bg mx-2 flex size-[50px] flex-none flex-col overflow-hidden rounded-[14px] border-none bg-neutral-100 p-0"
      >
        <span className="bg-accent h-3 w-full flex-none" />
        <span className="grid w-full flex-1 place-items-center text-2xl leading-none font-medium">+</span>
      </button>
      {RIGHT.map((item) => (
        <Tab key={item.href} item={item} active={isActive(pathname, item.href)} />
      ))}
    </nav>
  );
}

interface TabProps {
  item: NavItem;
  active: boolean;
}

function Tab({ item: { href, label, icon: Icon }, active }: TabProps) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-12 flex-1 flex-col items-center justify-center gap-[3px] text-[11px] no-underline ${active ? "text-text hover:text-text" : "text-neutral-500 hover:text-neutral-500"}`}
    >
      <Icon size={22} />
      {label}
    </Link>
  );
}
