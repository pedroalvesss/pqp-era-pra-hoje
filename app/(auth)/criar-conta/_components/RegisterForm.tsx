"use client";

import Link from "next/link";
import { useActionState, useState, type ChangeEvent } from "react";
import { register, type AuthState } from "@/actions/authActions";
import { AuthInput, FormMessage, PasswordInput, authTitleClass, submitClass } from "../../_components/AuthInput";

type Field = "name" | "email" | "password" | "password2";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, { error: "" });
  const [values, setValues] = useState<Record<Field, string>>({ name: "", email: "", password: "", password2: "" });

  function handleChangeInput(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  // o fuso do aparelho decide o que é "hoje"
  function handleSubmitForm(form: FormData) {
    form.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);
    action(form);
  }

  return (
    <form action={handleSubmitForm} className="flex flex-col gap-3.5">
      <h2 className={authTitleClass}>chega de post-it.</h2>
      <AuthInput
        label="como te chamam?"
        name="name"
        autoComplete="given-name"
        value={values.name}
        onChange={handleChangeInput}
      />
      <AuthInput
        label="e-mail"
        name="email"
        type="email"
        autoComplete="email"
        value={values.email}
        onChange={handleChangeInput}
      />
      <PasswordInput
        label="senha (6+ caracteres)"
        name="password"
        autoComplete="new-password"
        value={values.password}
        onChange={handleChangeInput}
      />
      <PasswordInput
        label="repete a senha"
        name="password2"
        autoComplete="new-password"
        value={values.password2}
        onChange={handleChangeInput}
      />
      <FormMessage error={state.error} info={state.info} />
      <button type="submit" disabled={pending} className={submitClass}>
        criar conta
      </button>
      <div className="mt-1 text-[13px] text-neutral-400">
        já tem conta? <Link href="/entrar">entra</Link>
      </div>
    </form>
  );
}
