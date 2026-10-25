
import {
  describe,
  expect,
  it,
  vi,
  afterEach,
} from "vitest";

import { getHerbs } from "./herbService.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getHerbs", () => {
  it("mengambil daftar tanaman tanpa parameter pencarian", async () => {
    const herbs = [{ id: 1, name: "Jahe" }];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: herbs }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(getHerbs()).resolves.toEqual(herbs);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://ifs24051-pabwe2026-proyek1-backend.vercel.app/api/herbs",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: undefined,
      },
    );
  });

  it("menambahkan parameter pencarian jika search diisi", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ id: 2, name: "Kunyit" }],
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getHerbs({ search: " kunyit " }),
    ).resolves.toEqual([{ id: 2, name: "Kunyit" }]);

    const calledUrl = fetchMock.mock.calls[0][0];

    expect(calledUrl).toContain("search=kunyit");
  });

  it("tidak menambahkan parameter pencarian jika search kosong", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(
      getHerbs({ search: "" }),
    ).resolves.toEqual([]);

    const calledUrl = fetchMock.mock.calls[0][0];

    expect(calledUrl).not.toContain("search=");
  });

  it("melempar error ketika respons HTTP gagal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await expect(getHerbs()).rejects.toThrow(
      "Gagal mengambil data herbal (HTTP 500).",
    );
  });

  it("menolak respons null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => null,
      }),
    );

    await expect(getHerbs()).rejects.toThrow(
      "Format data herbal dari server tidak valid.",
    );
  });

  it("menolak success yang bukan true", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, data: [] }),
      }),
    );

    await expect(getHerbs()).rejects.toThrow(
      "Format data herbal dari server tidak valid.",
    );
  });

  it("menolak data yang bukan array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      }),
    );

    await expect(getHerbs()).rejects.toThrow(
      "Format data herbal dari server tidak valid.",
    );
  });

  it("meneruskan AbortSignal ke fetch", async () => {
    const controller = new AbortController();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await getHerbs({ signal: controller.signal });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://ifs24051-pabwe2026-proyek1-backend.vercel.app/api/herbs",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      },
    );
  });

  it("meneruskan AbortError tanpa mengubahnya", async () => {
    const error = new Error("Request dibatalkan");
    error.name = "AbortError";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(error),
    );

    await expect(getHerbs()).rejects.toBe(error);
  });

  it("menangani error fetch berupa nilai selain Error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue("network failure"),
    );

    await expect(getHerbs()).rejects.toThrow(
      "Terjadi kesalahan saat mengambil data herbal.",
    );
  });

  it("menangani kegagalan parsing JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      }),
    );

    await expect(getHerbs()).rejects.toThrow("Invalid JSON");
  });

  it("memangkas spasi pada pencarian dan mengodekan karakter khusus", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await getHerbs({ search: " jahe & kunyit " });

    expect(fetchMock.mock.calls[0][0]).toContain(
      "search=jahe+%26+kunyit",
    );
  });

  it("menerima pencarian berupa angka", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await getHerbs({ search: 123 });

    expect(fetchMock.mock.calls[0][0]).toContain(
      "search=123",
    );
  });
});
