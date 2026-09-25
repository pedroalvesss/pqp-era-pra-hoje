"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePassword } from "@/actions/authActions";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/schemas";
import { FormMessage, PasswordInput, authTitleClass, firstFormError, submitClass } from "../../_components/AuthInput";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", password2: "" },
  });

  async function handleSubmitForm(values: ResetPasswordInput) {
    const result = await updatePassword(token, values);
    if (result.error) setError("root", { message: result.error });
  }

  return (
    <form noValidate onSubmit={handleSubmit(handleSubmitForm)} className="flex flex-col gap-3.5">
      <h2 className={authTitleClass}>senha nova.</h2>
      <PasswordInput label="senha (6+ caracteres)" autoComplete="new-password" {...register("password")} />
      <PasswordInput label="repete a senha" autoComplete="new-password" {...register("password2")} />
      <FormMessage error={firstFormError(errors)} />
      <button type="submit" disabled={isSubmitting} className={submitClass}>
        salvar
      </button>
    </form>
  );
}
