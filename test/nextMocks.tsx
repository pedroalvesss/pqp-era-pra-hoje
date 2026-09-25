import type { AnchorHTMLAttributes } from "react";
import { vi } from "vitest";

export const router = { push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn() };
export const nav = { pathname: "/" };

/** Use com vi.mock("next/navigation", () => navigationMock) */
export const navigationMock = {
  useRouter: () => router,
  usePathname: () => nav.pathname,
  notFound: vi.fn(),
  redirect: vi.fn(),
};

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; scroll?: boolean };

/** Use com vi.mock("next/link", () => linkMock) */
export const linkMock = {
  default: (props: LinkProps) => {
    const anchor = { ...props };
    delete anchor.scroll;
    return <a {...anchor} />;
  },
};
