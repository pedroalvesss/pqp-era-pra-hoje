import type { ReactNode } from "react";

interface PageTitleProps {
  children: ReactNode;
  className?: string;
}

export function PageTitle({ children, className = "" }: PageTitleProps) {
  return (
    <h1
      className={`m-0 text-[34px] leading-[1.02] font-medium tracking-[-0.045em] text-balance md:text-[46px] ${className}`}
    >
      {children}
    </h1>
  );
}
