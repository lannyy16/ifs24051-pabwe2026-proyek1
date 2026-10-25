import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import useDocumentTitle from "./useDocumentTitle.js";

describe("useDocumentTitle", () => {
  it("memakai judul dasar untuk Beranda", () => {
    renderHook(() => useDocumentTitle("Beranda"));

    expect(document.title).toBe("HerbaNusantara");
  });

  it("menambahkan nama halaman pada judul", () => {
    renderHook(() => useDocumentTitle("Artikel"));

    expect(document.title).toBe("Artikel — HerbaNusantara");
  });
});
