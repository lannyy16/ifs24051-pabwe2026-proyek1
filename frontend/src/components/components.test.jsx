import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Footer from "./Footer.jsx";
import Navbar from "./Navbar.jsx";
import HerbCard, {
  herbDescription,
  herbEmoji,
  herbNameLatin,
} from "./HerbCard.jsx";
import HerbDetailModal from "./HerbDetailModal.jsx";

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

describe("Footer", () => {
  it("menampilkan tahun dan memanggil onNavigate", () => {
    const onNavigate = vi.fn();
    render(<Footer onNavigate={onNavigate} />);

    expect(
      screen.getByText(new RegExp(String(new Date().getFullYear()))),
    ).toBeTruthy();

    fireEvent.click(screen.getByText("Kembali ke Beranda"));
    expect(onNavigate).toHaveBeenCalledWith("Beranda");
  });
});

describe("Navbar", () => {
  it("menampilkan tombol masuk dan daftar saat belum login", () => {
    const onNavigate = vi.fn();
    render(
      <Navbar
        page="Beranda"
        onNavigate={onNavigate}
        user={null}
        onLogout={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Masuk"));
    fireEvent.click(screen.getByText("Daftar"));
    fireEvent.click(screen.getByText("Artikel"));

    expect(onNavigate).toHaveBeenCalledWith("Masuk");
    expect(onNavigate).toHaveBeenCalledWith("Daftar");
    expect(onNavigate).toHaveBeenCalledWith("Artikel");
    expect(screen.getByText("Beranda", { selector: "nav button" }).className)
      .toBe("active");
  });

  it("kembali ke beranda saat brand diklik", () => {
    const onNavigate = vi.fn();
    render(
      <Navbar
        page="Artikel"
        onNavigate={onNavigate}
        user={null}
        onLogout={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("KENALI KEKAYAAN HERBAL"));
    expect(onNavigate).toHaveBeenCalledWith("Beranda");
  });

  it("menampilkan tombol keluar saat sudah login", () => {
    const onLogout = vi.fn();
    render(
      <Navbar
        page="Dashboard"
        onNavigate={vi.fn()}
        user={{ name: "Sari" }}
        onLogout={onLogout}
      />,
    );

    expect(screen.queryByText("Masuk")).toBeNull();
    fireEvent.click(screen.getByText("Keluar"));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});

describe("helper HerbCard", () => {
  it("memakai nilai cadangan", () => {
    expect(herbNameLatin({})).toBe("Nama ilmiah belum tersedia");
    expect(herbNameLatin({ latin: "Latin" })).toBe("Latin");
    expect(herbDescription({})).toBe(
      "Belum ada deskripsi untuk tanaman ini.",
    );
    expect(herbDescription({ desc: "singkat" })).toBe("singkat");
    expect(herbEmoji({})).toBe("🌿");
  });
});

describe("HerbCard", () => {
  it("menampilkan data dan memanggil onClick", () => {
    const onClick = vi.fn();
    render(<HerbCard herb={herb} onClick={onClick} />);

    expect(screen.getByText("Jahe")).toBeTruthy();
    expect(screen.getByText("Rimpang")).toBeTruthy();
    expect(screen.queryByText(/Simpan/)).toBeNull();

    fireEvent.click(screen.getByLabelText("Lihat profil Jahe"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("menampilkan tombol simpan sesuai status", () => {
    const onToggleSave = vi.fn();
    const { rerender } = render(
      <HerbCard herb={herb} onClick={vi.fn()} onToggleSave={onToggleSave} />,
    );

    fireEvent.click(screen.getByText("♡ Simpan"));
    expect(onToggleSave).toHaveBeenCalledWith(1);

    rerender(
      <HerbCard
        herb={{ id: 2, name: "Kunyit", tag: "Akar" }}
        onClick={vi.fn()}
        isSaved
        onToggleSave={onToggleSave}
      />,
    );
    expect(screen.getByText("♥ Tersimpan")).toBeTruthy();
    expect(screen.getByText("Akar")).toBeTruthy();
  });
});

describe("HerbDetailModal", () => {
  it("tidak menampilkan apa pun tanpa herbal", () => {
    const { container } = render(
      <HerbDetailModal onClose={vi.fn()} onToggleSave={vi.fn()} />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("menampilkan detail lengkap dan menjalankan aksi", () => {
    const onClose = vi.fn();
    const onToggleSave = vi.fn();
    render(
      <HerbDetailModal
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
      <HerbDetailModal
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
      <HerbDetailModal
        herb={{ id: 4, name: "Temulawak", traditional: "Jamu." }}
        onClose={vi.fn()}
        onToggleSave={vi.fn()}
      />,
    );

    expect(screen.queryByText("Informasi manfaat belum tersedia.")).toBeNull();
  });
});
