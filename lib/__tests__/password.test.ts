import { describe, expect, it } from "vitest";
import { hashPassword, hashToken, newResetToken, verifyPassword } from "../password";

describe("senha", () => {
  it("hash com sal e verificação", async () => {
    const a = await hashPassword("123456");
    const b = await hashPassword("123456");
    expect(a).not.toBe(b);
    expect(a.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("123456", a)).toBe(true);
    expect(await verifyPassword("1234567", a)).toBe(false);
  });

  it("hash quebrado não passa", async () => {
    expect(await verifyPassword("x", "md5$abc")).toBe(false);
    expect(await verifyPassword("x", "")).toBe(false);
  });

  it("token de reset: banco guarda só o hash", () => {
    const { token, tokenHash } = newResetToken();
    expect(token).toHaveLength(64);
    expect(tokenHash).toBe(hashToken(token));
    expect(tokenHash).not.toContain(token);
  });
});
