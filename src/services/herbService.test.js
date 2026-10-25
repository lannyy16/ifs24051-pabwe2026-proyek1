
import { describe, expect, it, vi, afterEach } from "vitest";
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
      }
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

    await expect(getHerbs({ search: " kunyit " })).resolves.toEqual([
      { id: 2, name: "Kunyit" },
    ]);

    const calledUrl = fetchMock.mock.calls[0][0];

    expect(calledUrl).toContain("search=kunyit");
  });

  it("tidak menambahkan parameter pencarian jika search kosong", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await expect(getHerbs({ search: "" })).resolves.toEqual([]);

    const calledUrl = fetchMock.mock.calls[0][0];

    expect(calledUrl).not.toContain("search=");
  });

  it("melempar error ketika respons HTTP gagal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    );

    await expect(getHerbs()).rejects.toThrow(
      "Gagal mengambil data herbal (HTTP 500)."
    );
  });

  it("menolak respons null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => null,
      })
    );

    await expect(getHerbs()).rejects.toThrow(
      "Format data herbal dari server tidak valid."
    );
  });

  it("menolak success yang bukan true", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, data: [] }),
      })
    );

    await expect(getHerbs()).rejects.toThrow(
      "Format data herbal dari server tidak valid."
    );
  });

  it("menolak data yang bukan array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      })
    );

    await expect(getHerbs()).rejects.toThrow(
      "Format data herbal dari server tidak valid."
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
      }
    );
  });
});
