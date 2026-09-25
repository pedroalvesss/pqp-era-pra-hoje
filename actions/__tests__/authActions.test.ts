import { beforeEach, describe, expect, it, vi } from "vitest";

const { FakeAuthError, signIn } = vi.hoisted(() => ({ FakeAuthError: class extends Error {}, signIn: vi.fn() }));
vi.mock("next-auth", () => ({ AuthError: FakeAuthError }));
vi.mock("@/auth", () => ({ signIn, signOut: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ host: "pqp.app", "x-forwarded-proto": "https" }),
}));
const svc = vi.hoisted(() => ({
  postUser: vi.fn(async () => true),
  postPasswordResetToken: vi.fn(async () => ({ token: "t0k3n", email: "pedro@x.com" })),
  patchUserPasswordByResetToken: vi.fn(async () => "pedro@x.com" as string | null),
  sendResetEmail: vi.fn(),
}));
vi.mock("@/services/usuariosService/postUser", () => ({ postUser: svc.postUser }));
vi.mock("@/services/usuariosService/postPasswordResetToken", () => ({
  postPasswordResetToken: svc.postPasswordResetToken,
}));
vi.mock("@/services/usuariosService/patchUserPasswordByResetToken", () => ({
  patchUserPasswordByResetToken: svc.patchUserPasswordByResetToken,
}));
vi.mock("@/lib/mailer", () => ({ sendResetEmail: svc.sendResetEmail }));

import { forgotPassword, login, register, updatePassword } from "../authActions";

const signup = {
  name: "Pedro",
  email: "pedro@x.com",
  password: "123456",
  password2: "123456",
  timezone: "America/Belem",
};

describe("authActions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("login valida antes de chamar o Auth.js", async () => {
    expect(await login({ email: "x", password: "123456" })).toEqual({ error: "esse e-mail tá estranho." });
    expect(signIn).not.toHaveBeenCalled();
  });

  it("credencial errada vira mensagem; outro erro sobe (inclusive o redirect do Next)", async () => {
    signIn.mockRejectedValueOnce(new FakeAuthError("CredentialsSignin"));
    expect(await login({ email: "a@b.co", password: "123456" })).toEqual({ error: "e-mail ou senha errados." });
    signIn.mockRejectedValueOnce(new Error("NEXT_REDIRECT"));
    await expect(login({ email: "a@b.co", password: "123456" })).rejects.toThrow("NEXT_REDIRECT");
  });

  it("cadastro cria e já entra, com o toast de boas-vindas", async () => {
    await register(signup);
    expect(svc.postUser).toHaveBeenCalledWith({
      name: "Pedro",
      email: "pedro@x.com",
      password: "123456",
      timezone: "America/Belem",
    });
    expect(signIn).toHaveBeenCalledWith("credentials", {
      email: "pedro@x.com",
      password: "123456",
      redirectTo: "/?novo=1",
    });
  });

  it("cadastro com e-mail repetido", async () => {
    svc.postUser.mockResolvedValueOnce(false);
    expect(await register(signup)).toEqual({ error: "esse e-mail já tem conta. entra?" });
  });

  it("esqueci a senha manda o link e responde igual pra quem não existe", async () => {
    const ok = await forgotPassword("pedro@x.com");
    expect(svc.sendResetEmail).toHaveBeenCalledWith("pedro@x.com", "https://pqp.app/redefinir-senha?token=t0k3n");
    svc.postPasswordResetToken.mockResolvedValueOnce(null as never);
    expect(await forgotPassword("ninguem@x.com")).toEqual(ok);
    expect(svc.sendResetEmail).toHaveBeenCalledTimes(1);
  });

  it("troca de senha com link vencido", async () => {
    svc.patchUserPasswordByResetToken.mockResolvedValueOnce(null);
    expect(await updatePassword("t", { password: "123456", password2: "123456" })).toEqual({
      error: "esse link expirou. pede outro?",
    });
    expect(signIn).not.toHaveBeenCalled();
  });
});
