"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { register as registerUser } from "@/actions/authActions";
import { registerFormSchema, type RegisterInput } from "@/lib/schemas";
import {
  AuthInput,
  FormMessage,
  PasswordInput,
  authTitleClass,
  firstFormError,
  submitClass,
} from "../../_components/AuthInput";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { name: "", email: "", password: "", password2: "" },
  });

  // o fuso do aparelho decide o que é "hoje"
  async function handleSubmitForm(values: RegisterInput) {
    const result = await registerUser({ ...values, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    if (result.error) setError("root", { message: result.error });
  }

  return (
    <form noValidate onSubmit={handleSubmit(handleSubmitForm)} className="flex flex-col gap-3.5">
      <h2 className={authTitleClass}>chega de post-it.</h2>
      <AuthInput label="como te chamam?" autoComplete="given-name" {...register("name")} />
      <AuthInput label="e-mail" type="email" autoComplete="email" {...register("email")} />
      <PasswordInput label="senha (6+ caracteres)" autoComplete="new-password" {...register("password")} />
      <PasswordInput label="repete a senha" autoComplete="new-password" {...register("password2")} />
      <FormMessage error={firstFormError(errors)} />
      <button type="submit" disabled={isSubmitting} className={submitClass}>
        criar conta
      </button>
      <div className="mt-1 text-[13px] text-neutral-400">
        já tem conta? <Link href="/entrar">entra</Link>
      </div>
    </form>
  );
}
