import { describe, expect, it } from "vitest";
import { buildQueryString, trimTrailingSlashes } from "./url.js";

describe("trimTrailingSlashes", () => {
  it("menghapus semua garis miring di akhir", () => {
    expect(trimTrailingSlashes("http://x.test/api///")).toBe(
      "http://x.test/api",
    );
  });

  it("tidak mengubah teks tanpa garis miring di akhir", () => {
    expect(trimTrailingSlashes("http://x.test/api")).toBe(
      "http://x.test/api",
    );
  });

  it("menangani teks kosong dan hanya garis miring", () => {
    expect(trimTrailingSlashes("")).toBe("");
    expect(trimTrailingSlashes("///")).toBe("");
  });
});

describe("buildQueryString", () => {
  it("mengembalikan string kosong tanpa parameter", () => {
    expect(buildQueryString()).toBe("");
    expect(buildQueryString({})).toBe("");
  });

  it("memangkas spasi dan mengodekan karakter khusus", () => {
    expect(buildQueryString({ search: "  jahe & kunyit " })).toBe(
      "search=jahe+%26+kunyit",
    );
  });

  it("mengabaikan nilai kosong, null, undefined, dan spasi saja", () => {
    expect(
      buildQueryString({ a: "", b: null, c: undefined, d: "   ", e: 0 }),
    ).toBe("e=0");
  });

  it("mengubah angka menjadi string", () => {
    expect(buildQueryString({ page: 2 })).toBe("page=2");
  });
});
