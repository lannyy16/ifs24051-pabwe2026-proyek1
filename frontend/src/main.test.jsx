import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("main", () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = "";
    globalThis.scrollTo = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("merender aplikasi ke elemen #root", async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import("./main.jsx");

    await vi.waitFor(() =>
      expect(document.getElementById("root").innerHTML).not.toBe(""),
    );
  });

  it("melempar error jika #root tidak ada", async () => {
    await expect(import("./main.jsx")).rejects.toThrow(
      "Elemen root tidak ditemukan",
    );
  });
});
