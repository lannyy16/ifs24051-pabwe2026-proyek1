
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
      "http://localhost:3000/api/test",
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
      json: async () => ({
        success: true,
      }),
    });

    await apiRequest("/test");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer abc123",
        }),
      }),
    );

    expect(sessionStorage.getItem).toHaveBeenCalledWith(
      TOKEN_KEY,
    );
  });

  it("menambahkan Content-Type jika request memiliki body", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
      }),
    });

    await apiRequest("/test", {
      method: "POST",
      body: JSON.stringify({
        name: "Jahe",
      }),
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/test",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Jahe",
        }),
        headers: expect.objectContaining({
          Accept: "application/json",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("mempertahankan header tambahan dari pemanggil", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
      }),
    });

    await apiRequest("/test", {
      headers: {
        "X-Test": "test-value",
      },
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/test",
      expect.objectContaining({
        headers: {
          Accept: "application/json",
          "X-Test": "test-value",
        },
      }),
    );
  });

  it("melempar error jika backend tidak dapat dihubungi", async () => {
    fetch.mockRejectedValue(
      new Error("Network error"),
    );

    await expect(
      apiRequest("/test"),
    ).rejects.toThrow(
      "Tidak dapat terhubung ke backend. Pastikan backend berjalan.",
    );
  });

  it("meneruskan AbortError tanpa mengubahnya", async () => {
    const error = new Error("Request dibatalkan");
    error.name = "AbortError";

    fetch.mockRejectedValue(error);

    await expect(
      apiRequest("/test"),
    ).rejects.toBe(error);
  });

  it("melempar error jika respons JSON tidak valid", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    await expect(
      apiRequest("/test"),
    ).rejects.toThrow(
      "Response backend tidak valid.",
    );
  });

  it("melempar pesan error dari backend jika HTTP gagal", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: "Server bermasalah",
      }),
    });

    await expect(
      apiRequest("/test"),
    ).rejects.toThrow("Server bermasalah");
  });

  it("menggunakan pesan default jika HTTP gagal tanpa pesan", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(
      apiRequest("/test"),
    ).rejects.toThrow(
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

    await expect(
      apiRequest("/test"),
    ).rejects.toThrow("Permintaan ditolak");
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
    const herbs = [
      {
        id: 1,
        name: "Jahe",
      },
    ];

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
      "http://localhost:3000/api/herbs",
      expect.objectContaining({
        method: "GET",
      }),
    );
  });

  it("menambahkan parameter pencarian setelah spasi dipangkas", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    await getHerbs({
      search: "  jahe  ",
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/herbs?search=jahe",
      expect.any(Object),
    );
  });

  it("tidak menambahkan parameter jika pencarian hanya spasi", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    await getHerbs({
      search: "   ",
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/herbs",
      expect.any(Object),
    );
  });

  it("mengodekan karakter khusus pada pencarian", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    await getHerbs({
      search: "jahe & kunyit",
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/herbs?search=jahe+%26+kunyit",
      expect.any(Object),
    );
  });

  it("melempar error jika data herbal bukan array", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          name: "Jahe",
        },
      }),
    });

    await expect(
      getHerbs(),
    ).rejects.toThrow(
      "Data herbal dari backend tidak valid.",
    );
  });

  it("meneruskan AbortSignal ke request", async () => {
    const controller = new AbortController();

    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    await getHerbs({
      signal: controller.signal,
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/herbs",
      expect.objectContaining({
        signal: controller.signal,
      }),
    );
  });

  it("menerima pencarian berupa angka dan mengubahnya menjadi string", async () => {
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: [],
      }),
    });

    await getHerbs({
      search: 123,
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/herbs?search=123",
      expect.any(Object),
    );
  });
});
