import { describe, expect, it } from "vitest";
import { ROUTES, pageFromPath } from "./routes.js";

describe("pageFromPath", () => {
  it.each([
    ["/", "Beranda"],
    ["/katalog", "Katalog Herbal"],
    ["/finder", "Herbal Finder"],
    ["/artikel", "Artikel"],
    ["/dashboard", "Dashboard"],
    ["/auth/login", "Masuk"],
    ["/auth/register", "Daftar"],
    ["/login", "Masuk"],
    ["/register", "Daftar"],
  ])("memetakan %s ke %s", (path, page) => {
    expect(pageFromPath(path)).toBe(page);
  });

  it("mengabaikan huruf besar dan garis miring di akhir", () => {
    expect(pageFromPath("/KATALOG///")).toBe("Katalog Herbal");
  });

  it("kembali ke Beranda untuk path kosong atau tidak dikenal", () => {
    expect(pageFromPath("")).toBe("Beranda");
    expect(pageFromPath(undefined)).toBe("Beranda");
    expect(pageFromPath("///")).toBe("Beranda");
    expect(pageFromPath("/tidak-ada")).toBe("Beranda");
  });

  it("ROUTES konsisten dengan pageFromPath", () => {
    for (const [page, path] of Object.entries(ROUTES)) {
      expect(pageFromPath(path)).toBe(page);
    }
  });
});
