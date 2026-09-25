import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NOW } from "@/test/fixtures";
import { ToastProvider } from "@/contexts/ToastContext";

vi.mock("next/link", async () => (await import("@/test/nextMocks")).linkMock);
const auth = vi.hoisted(() => ({
  login: vi.fn(async () => ({ error: "e-mail ou senha errados." })),
  register: vi.fn(async (_: unknown, form: FormData) => ({ error: "", info: String(form.get("timezone")) })),
  forgotPassword: vi.fn(async () => ({ error: "", info: "relaxa, mandamos um link pro seu e-mail." })),
  updatePassword: vi.fn(async () => ({ error: "as senhas não bateram." })),
}));
vi.mock("@/actions/authActions", () => auth);

import { AuthHero } from "../_components/AuthHero";
import { LoginForm } from "../entrar/_components/LoginForm";
import { RegisterForm } from "../criar-conta/_components/RegisterForm";
import { ResetPasswordForm } from "../redefinir-senha/_components/ResetPasswordForm";

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mostra o erro do servidor e mantém o que foi digitado", async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("e-mail"), "pedro@x.com");
    await userEvent.type(screen.getByLabelText("senha"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("e-mail ou senha errados.");
    expect(screen.getByLabelText("e-mail")).toHaveValue("pedro@x.com");
  });

  it("mostrar senha", async () => {
    render(<LoginForm />);
    await userEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(screen.getByLabelText("senha")).toHaveAttribute("type", "text");
  });

  it("esqueci a senha manda o link", async () => {
    render(
      <ToastProvider>
        <LoginForm />
      </ToastProvider>,
    );
    await userEvent.type(screen.getByLabelText("e-mail"), "pedro@x.com");
    await userEvent.click(screen.getByText("esqueci a senha"));
    expect(auth.forgotPassword).toHaveBeenCalledWith("pedro@x.com");
    expect(await screen.findByText("relaxa, mandamos um link pro seu e-mail.")).toBeInTheDocument();
  });

  it("link expirado", () => {
    render(<LoginForm expiredLink />);
    expect(screen.getByRole("alert")).toHaveTextContent("esse link expirou");
  });
});

it("RegisterForm manda o fuso do aparelho", async () => {
  render(<RegisterForm />);
  await userEvent.click(screen.getByRole("button", { name: "criar conta" }));
  await waitFor(() => expect(auth.register).toHaveBeenCalled());
  expect(await screen.findByRole("status")).toHaveTextContent(Intl.DateTimeFormat().resolvedOptions().timeZone);
});

it("ResetPasswordForm mostra o erro", async () => {
  render(<ResetPasswordForm />);
  await userEvent.click(screen.getByRole("button", { name: "salvar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("as senhas não bateram.");
});

it("AuthHero traz a folhinha e a frase", () => {
  const { container } = render(<AuthHero now={NOW} />);
  expect(container.textContent).toContain("o caderninho que não esquece.");
  expect(container.textContent).toContain("era pra hoje?");
});
