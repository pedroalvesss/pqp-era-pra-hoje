import type { ReactNode } from "react";

interface FormGroupProps {
  children: ReactNode;
  /** Cor do hairline entre as linhas: `surface` no modal, `bg` no drawer. */
  hairline?: "surface" | "bg";
}

/** Grupo estilo iOS: fundo neutral-900, raio 14, linhas separadas por um hairline. */
export function FormGroup({ children, hairline = "surface" }: FormGroupProps) {
  const line =
    hairline === "surface"
      ? "[&>*+*]:shadow-[inset_0_1px_0_var(--color-surface)]"
      : "[&>*+*]:shadow-[inset_0_1px_0_var(--color-bg)]";
  return <div className={`flex flex-col overflow-hidden rounded-[14px] bg-neutral-900 ${line}`}>{children}</div>;
}

interface FormRowProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

export function FormRow({ label, htmlFor, children }: FormRowProps) {
  return (
    <div className="flex items-center gap-2.5 py-2 pr-3 pl-3.5">
      <label htmlFor={htmlFor} className="w-24 flex-none text-[13px] text-neutral-400">
        {label}
      </label>
      {children}
    </div>
  );
}

export const rowInputClass = "min-h-8 min-w-0 flex-1 border-none bg-transparent text-sm text-text outline-none tabular";
