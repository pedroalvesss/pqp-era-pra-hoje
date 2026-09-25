"use client";

import Link from "next/link";
import { useState, useTransition, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword, login } from "@/actions/authActions";
import { useToast } from "@/contexts/ToastContext";
import { loginSchema, type LoginInput } from "@/lib/schemas";
import {
  AuthInput,
  FormMessage,
  PasswordInput,
  authTitleClass,
  firstFormError,
  submitClass,
} from "../../_components/AuthInput";

interface LoginFormProps {
  expiredLink?: boolean;
}

export function LoginForm({ expiredLink = false }: LoginFormProps) {
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [notice, setNotice] = useState(expiredLink ? "esse link expirou. pede outro?" : "");
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  async function handleSubmitForm(values: LoginInput) {
    setNotice("");
    const result = await login(values);
    if (result.error) setError("root", { message: result.error });
  }

  function handleClickForgotLink(e: MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await forgotPassword(getValues("email"));
      toast(result.error || result.info || "");
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit(handleSubmitForm)} className="flex flex-col gap-3.5">
      <h2 className={authTitleClass}>entra aí.</h2>
      <AuthInput label="e-mail" type="email" autoComplete="email" {...register("email")} />
      <PasswordInput label="senha" autoComplete="current-password" {...register("password")} />
      <FormMessage error={firstFormError(errors) || notice} />
      <button type="submit" disabled={isSubmitting} className={submitClass}>
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
