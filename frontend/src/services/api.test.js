
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

const API_URL = "http://localhost:3000/api";

function mockSuccess(data = { success: true }) {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => data,
  });
}

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
    mockSuccess({ success: true, data: [] });

    const result = await apiRequest("/test");

    expect(result).toEqual({ success: true, data: [] });
    expect(fetch).toHaveBeenCalledWith(`${API_URL}/test`, {
      headers: { Accept: "application/json" },
    });
  });

  it("menambahkan token autentikasi jika tersedia", async () => {
    sessionStorage.getItem.mockReturnValue("abc123");
    mockSuccess();

    await apiRequest("/test");

    expect(sessionStorage.getItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer abc123",
        }),
      }),
    );
  });

  it("tidak menambahkan Authorization jika token kosong", async () => {
    mockSuccess();

    await apiRequest("/test");

    const [, options] = fetch.mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
  });

  it("menambahkan Content-Type jika request memiliki body", async () => {
    mockSuccess();

    const body = JSON.stringify({ name: "Jahe" });

    await apiRequest("/test", {
      method: "POST",
      body,
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({
        method: "POST",
        body,
        headers: expect.objectContaining({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("mempertahankan header tambahan dari pemanggil", async () => {
    mockSuccess();

    await apiRequest("/test", {
      headers: { "X-Test": "test-value" },
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({
        headers: {
          Accept: "application/json",
          "X-Test": "test-value",
        },
      }),
    );
  });

  it("mempertahankan Content-Type khusus dari pemanggil", async () => {
    mockSuccess();

    await apiRequest("/test", {
      method: "POST",
      body: "data",
      headers: { "Content-Type": "text/plain" },
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/test`,
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "text/plain",
        }),
      }),
    );
  });

  it("tidak menggandakan Content-Type dengan kapitalisasi berbeda", async () => {
    mockSuccess();

    await apiRequest("/test", {
      method: "POST",
      body: "data",
      headers: { "content-type": "text/plain" },
    });

    const [, options] = fetch.mock.calls[0];

    expect(options.headers).toHaveProperty(
      "content-type",
      "text/plain",
    );
    expect(options.headers).not.toHaveProperty("Content-Type");
  });

  it("tidak menambahkan Content-Type jika body null", async () => {
    mockSuccess();

    await apiRequest("/test", {
      method: "POST",
      body: null,
    });

    const [, options] = fetch.mock.calls[0];
    expect(options.headers).not.toHaveProperty("Content-Type");
  });

  it("mengembalikan token kosong jika sessionStorage melempar error", async () => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => {
        throw new Error("Storage tidak tersedia");
      }),
    });

    mockSuccess();

    await expect(apiRequest("/test")).resolves.toEqual({
      success: true,
    });

    const [, options] = fetch.mock.calls[0];
    expect(options.headers).not.toHaveProperty("Authorization");
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

  it("menggunakan pesan message dari backend jika HTTP gagal", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: "Server bermasalah",
      }),
    });

    await expect(apiRequest("/test")).rejects.toThrow(
      "Server bermasalah",
    );
  });

  it("menggunakan properti error jika message tidak tersedia", async () => {
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

  it("melempar error jika success bernilai false", async () => {
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
    mockSuccess({ success: true, data: herbs });

    await expect(getHerbs()).resolves.toEqual(herbs);

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("menambahkan parameter pencarian setelah spasi dipangkas", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({ search: "  jahe  " });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs?search=jahe`,
      expect.any(Object),
    );
  });

  it("tidak menambahkan parameter jika pencarian hanya spasi", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({ search: "   " });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs`,
      expect.any(Object),
    );
  });

  it("mengodekan karakter khusus pada pencarian", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({ search: "jahe & kunyit" });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs?search=jahe+%26+kunyit`,
      expect.any(Object),
    );
  });

  it("menerima pencarian berupa angka dan mengubahnya menjadi string", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({ search: 123 });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs?search=123`,
      expect.any(Object),
    );
  });

  it("menambahkan parameter tambahan yang valid", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({
      category: "rempah",
      page: 2,
      ignoredUndefined: undefined,
      ignoredNull: null,
      ignoredEmpty: "",
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs?category=rempah&page=2`,
      expect.any(Object),
    );
  });

  it("mengabaikan pencarian null dan kosong", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({ search: null });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs`,
      expect.any(Object),
    );
  });

  it("meneruskan AbortSignal ke request", async () => {
    const controller = new AbortController();
    mockSuccess({ success: true, data: [] });

    await getHerbs({ signal: controller.signal });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs`,
      expect.objectContaining({
        signal: controller.signal,
      }),
    );
  });

  it("melempar error jika data herbal bukan array", async () => {
    mockSuccess({
      success: true,
      data: { name: "Jahe" },
    });

    await expect(getHerbs()).rejects.toThrow(
      "Data herbal dari backend tidak valid.",
    );
  });

  it("menolak respons null", async () => {
    mockSuccess(null);

    await expect(getHerbs()).rejects.toThrow(
      "Data herbal dari backend tidak valid.",
    );
  });

  it("menolak respons tanpa data", async () => {
    mockSuccess({ success: true });

    await expect(getHerbs()).rejects.toThrow(
      "Data herbal dari backend tidak valid.",
    );
  });
});
