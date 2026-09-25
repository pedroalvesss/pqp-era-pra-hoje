"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lockup } from "@/components/Logo";
import { useNewDemand } from "@/contexts/NewDemandContext";
import { Avatar } from "./Avatar";
import { NAV_ITEMS, isActive } from "./navItems";

interface SidebarProps {
  userName: string;
  unread: number;
}

export function Sidebar({ userName, unread }: SidebarProps) {
  const pathname = usePathname();
  const { openNewDemand } = useNewDemand();
  const onProfile = pathname.startsWith("/perfil");

  function handleClickNewButton() {
    openNewDemand();
  }

  return (
    <aside className="hidden w-[228px] flex-none flex-col gap-[22px] overflow-auto px-3 py-5 shadow-[inset_-1px_0_0_var(--color-neutral-900)] md:flex">
      <div className="px-2">
        <Lockup markSize={26} textSize={14} />
      </div>
      <button
        onClick={handleClickNewButton}
        className="btn btn-primary justify-start gap-2 rounded-[10px] px-3 py-2.5 whitespace-nowrap"
      >
        + nova demanda
        <kbd className="text-accent-300 ml-auto font-sans text-[11px] opacity-80">N</kbd>
      </button>
      <nav aria-label="principal" className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-sm no-underline ${active ? "bg-surface text-text hover:text-text" : "hover:text-text text-neutral-400"}`}
            >
              <Icon size={17} />
              <span>{label}</span>
              {href === "/avisos" && unread > 0 && (
                <span className="tabular text-accent ml-auto text-xs font-semibold">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/perfil"
        aria-current={onProfile ? "page" : undefined}
        className={`text-text hover:text-text mt-auto flex items-center gap-2.5 rounded-[10px] p-2 no-underline ${onProfile ? "bg-surface" : ""}`}
      >
        <Avatar name={userName} />
        <span className="text-[13px]">{userName.toLowerCase()}</span>
      </Link>
    </aside>
  );
}
