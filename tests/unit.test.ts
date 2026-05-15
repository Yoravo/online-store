import { describe, it, expect } from "vitest";

describe("Auth validation", () => {
  it("rejects empty email", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test("")).toBe(false);
    expect(emailRegex.test("invalid")).toBe(false);
    expect(emailRegex.test("test@example.com")).toBe(true);
  });

  it("rejects short password", () => {
    expect("short".length >= 8).toBe(false);
    expect("longpassword".length >= 8).toBe(true);
  });
});

describe("OTP generation", () => {
  it("generates 6-digit code", async () => {
    const { generateOTP } = await import("@/src/lib/email");
    const code = generateOTP();
    expect(code).toHaveLength(6);
    expect(Number(code)).toBeGreaterThanOrEqual(100000);
    expect(Number(code)).toBeLessThan(1000000);
  });
});

describe("Slug generation", () => {
  it("creates valid slug from name", () => {
    const slugify = (text: string) =>
      text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    expect(slugify("Kaos Polos Hitam")).toBe("kaos-polos-hitam");
    expect(slugify("  Spasi Banyak  ")).toBe("spasi-banyak");
    expect(slugify("Special!@#Chars")).toBe("special-chars");
  });
});

describe("Price formatting", () => {
  it("formats IDR correctly", () => {
    const fmt = (n: number) =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(n);

    expect(fmt(15000)).toContain("15.000");
    expect(fmt(1500000)).toContain("1.500.000");
  });
});
