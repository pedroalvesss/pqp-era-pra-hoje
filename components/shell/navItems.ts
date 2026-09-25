import {
  BellIcon,
  ColumnsIcon,
  FolderSimpleIcon,
  HouseIcon,
  ListIcon,
  MagnifyingGlassIcon,
  type Icon,
} from "@phosphor-icons/react";

export interface NavItem {
  href: string;
  label: string;
  icon: Icon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "início", icon: HouseIcon },
  { href: "/demandas", label: "demandas", icon: ListIcon },
  { href: "/quadro", label: "quadro", icon: ColumnsIcon },
  { href: "/projetos", label: "projetos", icon: FolderSimpleIcon },
  { href: "/busca", label: "busca", icon: MagnifyingGlassIcon },
  { href: "/avisos", label: "avisos", icon: BellIcon },
];

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
