import { describe, expect, it } from "vitest";
import { NOT_FOUND_PAGE, ROUTES, pageFromPath } from "./routes.js";

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

  it("kembali ke Beranda untuk path kosong", () => {
    expect(pageFromPath("")).toBe("Beranda");
    expect(pageFromPath(undefined)).toBe("Beranda");
    expect(pageFromPath("///")).toBe("Beranda");
  });

  it("menandai path tidak dikenal sebagai halaman tidak ditemukan", () => {
    expect(pageFromPath("/tidak-ada")).toBe(NOT_FOUND_PAGE);
    expect(pageFromPath("/katalog/jahe")).toBe(NOT_FOUND_PAGE);
  });

  it("ROUTES konsisten dengan pageFromPath", () => {
    for (const [page, path] of Object.entries(ROUTES)) {
      expect(pageFromPath(path)).toBe(page);
    }
  });
});
