"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { updatePassword, type AuthState } from "@/actions/authActions";
import { FormMessage, PasswordInput, authTitleClass, submitClass } from "../../_components/AuthInput";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, { error: "" });
  const [values, setValues] = useState({ password: "", password2: "" });

  function handleChangeInput(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  }

  return (
    <form action={action} className="flex flex-col gap-3.5">
      <h2 className={authTitleClass}>senha nova.</h2>
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
      <FormMessage error={state.error} />
      <button type="submit" disabled={pending} className={submitClass}>
        salvar
      </button>
    </form>
  );
}
