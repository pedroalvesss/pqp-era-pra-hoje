"use client";

import Link from "next/link";
import { useActionState, useState, useTransition, type ChangeEvent, type MouseEvent } from "react";
import { forgotPassword, login, type AuthState } from "@/actions/authActions";
import { useToast } from "@/contexts/ToastContext";
import { AuthInput, FormMessage, PasswordInput, authTitleClass, submitClass } from "../../_components/AuthInput";

interface LoginFormProps {
  expiredLink?: boolean;
}

export function LoginForm({ expiredLink = false }: LoginFormProps) {
  const toast = useToast();
  const [state, action, pending] = useActionState<AuthState, FormData>(login, {
    error: expiredLink ? "esse link expirou. pede outro?" : "",
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, startTransition] = useTransition();

  function handleChangeEmailInput(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }
  function handleChangePasswordInput(e: ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }
  function handleClickForgotLink(e: MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await forgotPassword(email);
      toast(result.error || result.info || "");
    });
  }

  return (
    <form action={action} className="flex flex-col gap-3.5">
      <h2 className={authTitleClass}>entra aí.</h2>
      <AuthInput
        label="e-mail"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={handleChangeEmailInput}
      />
      <PasswordInput
        label="senha"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={handleChangePasswordInput}
      />
      <FormMessage error={state.error} info={state.info} />
      <button type="submit" disabled={pending} className={submitClass}>
        entrar
      </button>
      <div className="mt-1 flex items-center justify-between text-[13px]">
        <a href="#" onClick={handleClickForgotLink} className="text-neutral-400 no-underline hover:text-neutral-300">
          esqueci a senha
        </a>
        <Link href="/criar-conta">criar conta</Link>
      </div>
    </form>
  );
}
