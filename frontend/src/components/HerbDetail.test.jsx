import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import HerbDetail from "./HerbDetail.jsx";

const herb = {
  id: 1,
  name: "Jahe",
  scientificName: "Zingiber officinale",
  description: "Rimpang hangat.",
  emoji: "🫚",
  color: "#fff3d6",
  category: "Rimpang",
  traditional: "Dipakai sebagai wedang.",
  benefits: ["Menghangatkan", "Meredakan mual"],
  evidence: "Ada studi klinis kecil.",
  safety: "Hati-hati pada pengencer darah.",
};

describe("HerbDetail", () => {
  it("tidak menampilkan apa pun tanpa herbal", () => {
    const { container } = render(
      <HerbDetail onClose={vi.fn()} onToggleSave={vi.fn()} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("menampilkan detail lengkap dan menjalankan aksi", () => {
    const onClose = vi.fn();
    const onToggleSave = vi.fn();
    render(
      <HerbDetail
        herb={herb}
        onClose={onClose}
        saved={false}
        onToggleSave={onToggleSave}
      />,
    );

    expect(screen.getByText("Menghangatkan")).toBeTruthy();
    expect(screen.getByText("Dipakai sebagai wedang.")).toBeTruthy();
    expect(screen.getByText("Ada studi klinis kecil.")).toBeTruthy();

    fireEvent.click(screen.getByText("Simpan herbal"));
    expect(onToggleSave).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText("Kembali ke katalog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("memakai teks cadangan untuk data yang kosong", () => {
    render(
      <HerbDetail
        herb={{ id: 3, name: "Sirih" }}
        onClose={vi.fn()}
        saved
        onToggleSave={vi.fn()}
      />,
    );

    expect(screen.getByText("Tersimpan")).toBeTruthy();
    expect(screen.getByText("Informasi manfaat belum tersedia.")).toBeTruthy();
    expect(screen.getByText(/Informasi bukti ilmiah belum tersedia/)).toBeTruthy();
    expect(screen.getByText(/kemungkinan alergi/)).toBeTruthy();
  });

  it("tidak menampilkan pesan kosong jika ada manfaat tradisional", () => {
    render(
      <HerbDetail
        herb={{ id: 4, name: "Temulawak", traditional: "Jamu." }}
        onClose={vi.fn()}
        onToggleSave={vi.fn()}
      />,
    );

    expect(screen.queryByText("Informasi manfaat belum tersedia.")).toBeNull();
  });

  it("menutup detail saat tombol Escape ditekan", () => {
    const onClose = vi.fn();
    render(
      <HerbDetail herb={herb} onClose={onClose} onToggleSave={vi.fn()} />,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("memindahkan fokus ke judul saat dibuka", () => {
    render(
      <HerbDetail herb={herb} onClose={vi.fn()} onToggleSave={vi.fn()} />,
    );

    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "Jahe", level: 1 }),
    );
  });
});
