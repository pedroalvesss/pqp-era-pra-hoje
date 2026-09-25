"use client";

import { useState, type InputHTMLAttributes } from "react";
import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import type { FieldErrors } from "react-hook-form";

type AuthInputProps = InputHTMLAttributes<HTMLInputElement> & { label: string };

const base = "input min-h-12 rounded-xl text-[15px]";

export function AuthInput({ label, className = "", ...props }: AuthInputProps) {
  return <input aria-label={label} placeholder={label} className={`${base} ${className}`} {...props} />;
}

export function PasswordInput(props: AuthInputProps) {
  const [visible, setVisible] = useState(false);

  function handleClickEyeButton() {
    setVisible((v) => !v);
  }

  return (
    <div className="relative">
      <AuthInput {...props} type={visible ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={handleClickEyeButton}
        aria-label={visible ? "Esconder senha" : "Mostrar senha"}
        className="btn btn-icon absolute top-1.5 right-1.5 text-neutral-400"
      >
        {visible ? <EyeSlashIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

interface FormMessageProps {
  error?: string;
  info?: string;
}

export function FormMessage({ error, info }: FormMessageProps) {
  if (error)
    return (
      <p role="alert" className="text-late m-0 text-[13px]">
        {error}
      </p>
    );
  if (info)
    return (
      <p role="status" className="m-0 text-[13px] text-neutral-300">
        {info}
      </p>
    );
  return null;
}

/** O design mostra um erro por vez: o primeiro campo inválido, senão o erro do servidor. */
export function firstFormError(errors: FieldErrors) {
  const field = Object.entries(errors).find(([key, e]) => key !== "root" && e?.message)?.[1];
  return String(field?.message ?? errors.root?.message ?? "");
}

export const submitClass = "btn btn-primary mt-1 min-h-12 rounded-xl text-[15px]";
export const authTitleClass = "m-0 mb-2 text-[34px] font-medium tracking-[-0.04em]";
