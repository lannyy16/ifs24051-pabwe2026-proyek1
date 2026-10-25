import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CatalogPage from "./CatalogPage.jsx";

const herbs = [
  { id: 1, name: "Jahe", category: "Rimpang" },
  { id: 2, name: "Kemangi", category: "Daun" },
  { id: 3, name: "Pegagan", tag: "Daun" },
  { id: 4, name: "Misterius" },
];

describe("CatalogPage", () => {
  function setup(props = {}) {
    const handlers = {
      onSearch: vi.fn(),
      onCategory: vi.fn(),
      onSelectHerb: vi.fn(),
      onToggleSave: vi.fn(),
      onRetry: vi.fn(),
    };

    render(
      <CatalogPage
        herbs={herbs}
        search=""
        category="Semua"
        savedIds={[1]}
        {...handlers}
        {...props}
      />,
    );

    return handlers;
  }

  it("menampilkan semua herbal dan kategori unik", () => {
    setup();

    expect(screen.getAllByRole("button", { pressed: false })).toBeTruthy();
    expect(screen.getByText("Semua", { selector: "button" })).toBeTruthy();
    expect(screen.getByText("Rimpang", { selector: "button" })).toBeTruthy();
    expect(screen.getAllByText("Daun", { selector: "button" })).toHaveLength(1);
    expect(screen.getByText("Misterius")).toBeTruthy();
    expect(screen.getByText("♥ Tersimpan")).toBeTruthy();
  });

  it("memfilter berdasarkan kategori", () => {
    setup({ category: "Daun" });

    expect(screen.getByText("Kemangi")).toBeTruthy();
    expect(screen.getByText("Pegagan")).toBeTruthy();
    expect(screen.queryByText("Jahe")).toBeNull();
  });

  it("menjalankan pencarian, kategori, pilih herbal, dan simpan", () => {
    const handlers = setup();

    fireEvent.change(screen.getByLabelText("Cari tanaman herbal"), {
      target: { value: "jah" },
    });
    expect(handlers.onSearch).toHaveBeenCalledWith("jah");

    fireEvent.click(screen.getByText("Rimpang", { selector: "button" }));
    expect(handlers.onCategory).toHaveBeenCalledWith("Rimpang");

    fireEvent.click(screen.getByLabelText("Lihat profil Jahe"));
    expect(handlers.onSelectHerb).toHaveBeenCalledWith(herbs[0]);

    fireEvent.click(screen.getAllByText("♡ Simpan")[0]);
    expect(handlers.onToggleSave).toHaveBeenCalledWith(2);
  });

  it("menampilkan status memuat", () => {
    setup({ loading: true });

    expect(screen.getByText("Memuat data tanaman...")).toBeTruthy();
    expect(screen.queryByText("Jahe")).toBeNull();
  });

  it("menampilkan error dan tombol coba lagi", () => {
    const handlers = setup({ error: "Gagal memuat" });

    expect(screen.getByRole("alert").textContent).toContain("Gagal memuat");
    fireEvent.click(screen.getByText("Coba lagi"));
    expect(handlers.onRetry).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Jahe")).toBeNull();
  });

  it("menampilkan pesan jika tidak ada hasil", () => {
    setup({ herbs: [] });

    expect(screen.getByText(/Tanaman tidak ditemukan/)).toBeTruthy();
  });
});
