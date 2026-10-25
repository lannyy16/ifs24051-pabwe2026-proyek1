
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

import {
  apiRequest,
  getHerbs,
  TOKEN_KEY,
} from "./api.js";

describe("apiRequest", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn().mockReturnValue(null),
    });

    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("berhasil mengambil data dari backend", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    const result = await apiRequest("/test");

    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/test$/),
      {
        headers: {
          Accept: "application/json",
        },
      },
    );
  });

  it("menambahkan token autentikasi jika tersedia", async () => {
    sessionStorage.getItem.mockReturnValue("abc123");

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await apiRequest("/test");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer abc123",
        }),
      }),
    );

    expect(sessionStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
  });

  it("menambahkan Content-Type jika request memiliki body", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await apiRequest("/test", {
      method: "POST",
      body: JSON.stringify({ name: "Jahe" }),
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("mempertahankan Content-Type khusus dari pemanggil", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await apiRequest("/test", {
      method: "POST",
      body: "data",
      headers: {
        "Content-Type": "text/plain",
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "text/plain",
        }),
      }),
    );
  });

  it("mempertahankan header tambahan dari pemanggil", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await apiRequest("/test", {
      headers: { "X-Test": "test-value" },
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          Accept: "application/json",
          "X-Test": "test-value",
        },
      }),
    );
  });

  it("mengembalikan token kosong jika sessionStorage melempar error", async () => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => {
        throw new Error("Storage tidak tersedia");
      }),
    });

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await apiRequest("/test");

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: { Accept: "application/json" },
      }),
    );
  });

  it("melempar error jika backend tidak dapat dihubungi", async () => {
    fetch.mockRejectedValue(new Error("Network error"));

    await expect(apiRequest("/test")).rejects.toThrow(
      "Tidak dapat terhubung ke backend. Pastikan backend berjalan.",
    );
  });

  it("meneruskan AbortError tanpa mengubahnya", async () => {
    const error = new Error("Request dibatalkan");
    error.name = "AbortError";

    fetch.mockRejectedValue(error);

    await expect(apiRequest("/test")).rejects.toBe(error);
  });

  it("melempar error jika respons JSON tidak valid", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    await expect(apiRequest("/test")).rejects.toThrow(
      "Response backend tidak valid.",
    );
  });

  it("menggunakan pesan message jika HTTP gagal", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Server bermasalah" }),
    });

    await expect(apiRequest("/test")).rejects.toThrow(
      "Server bermasalah",
    );
  });

  it("menggunakan pesan error jika message tidak tersedia", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "Layanan gagal" }),
    });

    await expect(apiRequest("/test")).rejects.toThrow(
      "Layanan gagal",
    );
  });

  it("menggunakan pesan default jika HTTP gagal tanpa pesan", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(apiRequest("/test")).rejects.toThrow(
      "Request gagal dengan status 500.",
    );
  });

  it("melempar error jika success false dan message tersedia", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: false,
        message: "Permintaan ditolak",
      }),
    });

    await expect(apiRequest("/test")).rejects.toThrow(
      "Permintaan ditolak",
    );
  });

  it("menggunakan pesan default jika success false tanpa message", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: false }),
    });

    await expect(apiRequest("/test")).rejects.toThrow(
      "Request API gagal.",
    );
  });
});

describe("getHerbs", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn().mockReturnValue(null),
    });

    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("mengambil daftar herbal tanpa parameter pencarian", async () => {
    const herbs = [{ id: 1, name: "Jahe" }];

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: herbs,
      }),
    });

    const result = await getHerbs();

    expect(result).toEqual(herbs);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/herbs$/),
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("menambahkan pencarian setelah spasi dipangkas", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    });

    await getHerbs({ search: "  jahe  " });

    expect(fetch.mock.calls[0][0]).toContain("search=jahe");
  });

  it("tidak menambahkan parameter jika pencarian hanya spasi", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    });

    await getHerbs({ search: "   " });

    expect(fetch.mock.calls[0][0]).toMatch(/\/herbs$/);
  });

  it("mengodekan karakter khusus pada pencarian", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    });

    await getHerbs({ search: "jahe & kunyit" });

    expect(fetch.mock.calls[0][0]).toContain(
      "search=jahe+%26+kunyit",
    );
  });

  it("mengubah pencarian angka menjadi string", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    });

    await getHerbs({ search: 123 });

    expect(fetch.mock.calls[0][0]).toContain("search=123");
  });

  it("menambahkan parameter tambahan yang valid", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    });

    await getHerbs({
      category: "rempah",
      page: 2,
      ignored: "",
      absent: null,
      missing: undefined,
    });

    const url = fetch.mock.calls[0][0];

    expect(url).toContain("category=rempah");
    expect(url).toContain("page=2");
    expect(url).not.toContain("ignored=");
    expect(url).not.toContain("absent=");
    expect(url).not.toContain("missing=");
  });

  it("tidak menambahkan signal sebagai parameter URL", async () => {
    const controller = new AbortController();

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: [] }),
    });

    await getHerbs({ signal: controller.signal });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/herbs$/),
      expect.objectContaining({
        signal: controller.signal,
      }),
    );
  });

  it("melempar TypeError jika data herbal bukan array", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { name: "Jahe" },
      }),
    });

    await expect(getHerbs()).rejects.toThrow(
      "Data herbal dari backend tidak valid.",
    );
  });
});
