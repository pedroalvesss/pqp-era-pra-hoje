import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NOW } from "@/test/fixtures";
import { ToastProvider } from "@/contexts/ToastContext";

vi.mock("next/link", async () => (await import("@/test/nextMocks")).linkMock);
const auth = vi.hoisted(() => ({
  login: vi.fn(async () => ({ error: "e-mail ou senha errados." })),
  register: vi.fn(async () => ({ error: "esse e-mail já tem conta. entra?" })),
  forgotPassword: vi.fn(async () => ({ error: "", info: "relaxa, mandamos um link pro seu e-mail." })),
  updatePassword: vi.fn(async () => ({ error: "esse link expirou. pede outro?" })),
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
    expect(auth.login).toHaveBeenCalledWith({ email: "pedro@x.com", password: "123456" });
  });

  it("valida no client antes de ir pro servidor", async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText("e-mail"), "pedro");
    await userEvent.click(screen.getByRole("button", { name: "entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("esse e-mail tá estranho.");
    expect(auth.login).not.toHaveBeenCalled();
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

describe("RegisterForm", () => {
  beforeEach(() => vi.clearAllMocks());

  async function fill(password2 = "123456") {
    render(<RegisterForm />);
    await userEvent.type(screen.getByLabelText("como te chamam?"), "Pedro");
    await userEvent.type(screen.getByLabelText("e-mail"), "pedro@x.com");
    await userEvent.type(screen.getByLabelText("senha (6+ caracteres)"), "123456");
    await userEvent.type(screen.getByLabelText("repete a senha"), password2);
    await userEvent.click(screen.getByRole("button", { name: "criar conta" }));
  }

  it("senhas diferentes nem chegam no servidor", async () => {
    await fill("654321");
    expect(await screen.findByRole("alert")).toHaveTextContent("as senhas não bateram.");
    expect(auth.register).not.toHaveBeenCalled();
  });

  it("manda o fuso do aparelho e mostra o erro do servidor", async () => {
    await fill();
    await waitFor(() =>
      expect(auth.register).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Pedro", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
      ),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("esse e-mail já tem conta. entra?");
  });
});

it("ResetPasswordForm manda o token junto", async () => {
  render(<ResetPasswordForm token="t0k3n" />);
  await userEvent.type(screen.getByLabelText("senha (6+ caracteres)"), "123456");
  await userEvent.type(screen.getByLabelText("repete a senha"), "123456");
  await userEvent.click(screen.getByRole("button", { name: "salvar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("esse link expirou. pede outro?");
  expect(auth.updatePassword).toHaveBeenCalledWith("t0k3n", { password: "123456", password2: "123456" });
});

it("AuthHero traz a folhinha e a frase", () => {
  const { container } = render(<AuthHero now={NOW} />);
  expect(container.textContent).toContain("o caderninho que não esquece.");
  expect(container.textContent).toContain("era pra hoje?");
});
