import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchCurrentUser,
  getAuthError,
  getAuthResult,
  isValidEmail,
  loginUser,
  registerUser,
  validateAuthForm,
} from "./authService.js";

function mockResponse(data, ok = true, status = 200) {
  fetch.mockResolvedValue({ ok, status, json: async () => data });
}

describe("isValidEmail", () => {
  it.each(["a@b.co", "nama.belakang@mail.example.com"])(
    "menerima %s",
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each([
    "",
    "tanpa-at.com",
    "@b.co",
    "a@@b.co",
    "a@b@c.co",
    "a@b",
    "a@.co",
    "a@b.",
    "a b@c.co",
    `${"a".repeat(250)}@b.co`,
  ])("menolak %j", (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

describe("validateAuthForm", () => {
  const valid = {
    name: "  Sari  ",
    email: "  SARI@Mail.COM ",
    password: "rahasia123",
    confirmation: "rahasia123",
  };

  it("menolak email tidak valid", () => {
    expect(validateAuthForm({ email: "x" }, false)).toEqual({
      error: "Masukkan alamat email yang valid.",
    });
  });

  it("menolak form bertipe tidak valid", () => {
    expect(validateAuthForm({ email: 123 }, false).error).toBeDefined();
  });

  it("menolak password kosong", () => {
    expect(validateAuthForm({ email: "a@b.co" }, false)).toEqual({
      error: "Kata sandi wajib diisi.",
    });
  });

  it("menerima login yang valid dan menormalkan email", () => {
    expect(validateAuthForm(valid, false)).toEqual({
      email: "sari@mail.com",
      password: "rahasia123",
    });
  });

  it("menerima registrasi yang valid", () => {
    expect(validateAuthForm(valid, true)).toEqual({
      name: "Sari",
      email: "sari@mail.com",
      password: "rahasia123",
    });
  });

  it("menolak nama yang terlalu pendek", () => {
    expect(validateAuthForm({ ...valid, name: "S" }, true).error).toBe(
      "Nama minimal 2 karakter.",
    );
    expect(
      validateAuthForm({ ...valid, name: undefined }, true).error,
    ).toBe("Nama minimal 2 karakter.");
  });

  it("menolak password pendek", () => {
    expect(
      validateAuthForm(
        { ...valid, password: "abc", confirmation: "abc" },
        true,
      ).error,
    ).toBe("Kata sandi harus minimal 8 karakter.");
  });

  it("menolak konfirmasi yang berbeda", () => {
    expect(
      validateAuthForm({ ...valid, confirmation: "lain-lain1" }, true)
        .error,
    ).toBe("Konfirmasi kata sandi tidak cocok.");
  });
});

describe("getAuthError", () => {
  it("memakai pesan Error atau fallback", () => {
    expect(getAuthError(new Error("gagal"), "cadangan")).toBe("gagal");
    expect(getAuthError("teks", "cadangan")).toBe("cadangan");
  });
});

describe("getAuthResult", () => {
  it("mengembalikan user dan token", () => {
    expect(
      getAuthResult({ data: { user: { id: 1 }, token: "t" } }),
    ).toEqual({ authenticatedUser: { id: 1 }, token: "t" });
  });

  it("melempar error jika data tidak lengkap", () => {
    expect(() => getAuthResult({})).toThrow("tidak lengkap");
    expect(() => getAuthResult({ data: { user: { id: 1 } } })).toThrow();
  });
});

describe("request autentikasi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("registerUser mengirim POST ke /auth/register", async () => {
    mockResponse({ data: { user: { id: 1 }, token: "t" } });

    const result = await registerUser({ email: "a@b.co" });

    expect(result.token).toBe("t");
    const [url, options] = fetch.mock.calls[0];
    expect(url).toMatch(/\/auth\/register$/);
    expect(options.method).toBe("POST");
    expect(options.body).toBe('{"email":"a@b.co"}');
  });

  it("loginUser mengirim POST ke /auth/login", async () => {
    mockResponse({ data: { user: { id: 2 }, token: "x" } });

    const result = await loginUser({ email: "a@b.co" });

    expect(result.authenticatedUser).toEqual({ id: 2 });
    expect(fetch.mock.calls[0][0]).toMatch(/\/auth\/login$/);
  });

  it("fetchCurrentUser mengembalikan pengguna", async () => {
    mockResponse({ data: { user: { id: 3 } } });

    await expect(fetchCurrentUser()).resolves.toEqual({ id: 3 });
  });

  it("fetchCurrentUser melempar error tanpa pengguna", async () => {
    mockResponse({ data: {} });

    await expect(fetchCurrentUser()).rejects.toThrow(
      "Data pengguna tidak ditemukan.",
    );
  });
});
