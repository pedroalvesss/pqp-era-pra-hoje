interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** Marca 1b, "folha do dia". */
export function LogoMark({ size = 26, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      style={{ flex: "none" }}
    >
      <rect width="32" height="32" rx="8" fill="var(--color-neutral-100)" />
      <path d="M0 8 A8 8 0 0 1 8 0 H24 A8 8 0 0 1 32 8 V10 H0 Z" fill="var(--color-accent)" />
      <circle cx="10" cy="5" r="1.4" fill="var(--color-bg)" />
      <circle cx="22" cy="5" r="1.4" fill="var(--color-bg)" />
      <text
        x="16"
        y="27"
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontWeight="600"
        fontSize="16"
        fill="var(--color-bg)"
      >
        ?
      </text>
    </svg>
  );
}

interface LockupProps {
  markSize?: number;
  textSize?: number;
}

export function Lockup({ markSize = 30, textSize = 16 }: LockupProps) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={markSize} />
      <span className="font-medium tracking-[-0.02em] whitespace-nowrap" style={{ fontSize: textSize }}>
        pqp, era pra <span className="text-accent">hoje?</span>
      </span>
    </div>
  );
}
