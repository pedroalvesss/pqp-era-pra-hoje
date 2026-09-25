import Link from "next/link";
import { BellIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { LogoMark } from "@/components/Logo";
import { Avatar } from "./Avatar";

interface MobileTopBarProps {
  userName: string;
  unread: number;
}

const iconLink = "btn btn-icon relative size-11 text-xl text-text hover:text-text";

export function MobileTopBar({ userName, unread }: MobileTopBarProps) {
  return (
    <header className="flex flex-none items-center gap-2 pt-[calc(10px+env(safe-area-inset-top))] pr-1.5 pb-0.5 pl-4 md:hidden">
      <Link href="/" aria-label="início">
        <LogoMark size={26} />
      </Link>
      <div className="ml-auto flex items-center">
        <Link href="/busca" aria-label="Busca" className={iconLink}>
          <MagnifyingGlassIcon />
        </Link>
        <Link href="/avisos" aria-label={unread ? `Avisos, ${unread} não lidos` : "Avisos"} className={iconLink}>
          <BellIcon />
          {unread > 0 && <span className="bg-accent absolute top-2.5 right-[11px] size-2 rounded-full" />}
        </Link>
        <Link href="/perfil" aria-label="Perfil" className={iconLink}>
          <Avatar name={userName} />
        </Link>
      </div>
    </header>
  );
}
