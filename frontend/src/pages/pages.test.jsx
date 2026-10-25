import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import HomePage from "./HomePage.jsx";
import CatalogPage from "./CatalogPage.jsx";
import DashboardPage from "./DashboardPage.jsx";
import FinderPage from "./FinderPage.jsx";
import ArticlesPage from "./ArticlesPage.jsx";
import AuthPage from "./AuthPage.jsx";

const herbs = [
  { id: 1, name: "Jahe", category: "Rimpang" },
  { id: 2, name: "Kemangi", category: "Daun" },
  { id: 3, name: "Pegagan", tag: "Daun" },
  { id: 4, name: "Misterius" },
];

describe("HomePage", () => {
  it("menampilkan 3 herbal pertama dan menangani navigasi", () => {
    const onNavigate = vi.fn();
    const onSelectHerb = vi.fn();
    render(
      <HomePage
        herbs={herbs}
        onNavigate={onNavigate}
        onSelectHerb={onSelectHerb}
      />,
    );

    expect(screen.getByText("04")).toBeTruthy();
    expect(screen.queryByText("Misterius")).toBeNull();

    fireEvent.click(screen.getByLabelText("Lihat profil Jahe"));
    expect(onSelectHerb).toHaveBeenCalledWith(herbs[0]);

    fireEvent.click(screen.getByText("Jelajahi herbal"));
    fireEvent.click(screen.getByText("Cari berdasarkan topik"));
    fireEvent.click(screen.getByText("Lihat semua"));
    fireEvent.click(screen.getByText("Mulai pencarian"));
    fireEvent.click(screen.getByText("Rimpang", { selector: "b" }));

    expect(onNavigate).toHaveBeenCalledWith("Herbal Finder");
    expect(onNavigate).toHaveBeenCalledWith("Katalog Herbal");
    expect(onNavigate).toHaveBeenCalledWith("Katalog Herbal", "Rimpang");
  });
});

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

describe("DashboardPage", () => {
  const base = {
    herbs,
    onSelectHerb: vi.fn(),
    onToggleSave: vi.fn(),
    onNavigate: vi.fn(),
  };

  it("menampilkan pesan kosong tanpa herbal tersimpan", () => {
    const onNavigate = vi.fn();
    render(
      <DashboardPage
        {...base}
        user={null}
        savedIds={[]}
        onNavigate={onNavigate}
      />,
    );

    expect(screen.getByText("Ruang herbal saya")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Buka katalog/ }));
    expect(onNavigate).toHaveBeenCalledWith("Katalog Herbal");
  });

  it("menampilkan herbal tersimpan milik pengguna", () => {
    const onSelectHerb = vi.fn();
    const onToggleSave = vi.fn();
    render(
      <DashboardPage
        {...base}
        user={{ name: "Sari" }}
        savedIds={[1]}
        onSelectHerb={onSelectHerb}
        onToggleSave={onToggleSave}
      />,
    );

    expect(screen.getByText("Halo, Sari")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Lihat profil Jahe"));
    expect(onSelectHerb).toHaveBeenCalledWith(herbs[0]);

    fireEvent.click(screen.getByText("♥ Tersimpan"));
    expect(onToggleSave).toHaveBeenCalledWith(1);
  });
});

describe("FinderPage", () => {
  it("mengirim kata kunci topik yang dipilih", () => {
    const onChooseTopic = vi.fn();
    render(<FinderPage onChooseTopic={onChooseTopic} />);

    fireEvent.click(screen.getByText("Mual ringan"));
    fireEvent.click(screen.getByText("Pencernaan"));

    expect(onChooseTopic).toHaveBeenNthCalledWith(1, "jahe");
    expect(onChooseTopic).toHaveBeenNthCalledWith(2, "");
  });
});

describe("ArticlesPage", () => {
  it("menampilkan daftar artikel", () => {
    render(<ArticlesPage />);

    expect(screen.getByText("Artikel herbal")).toBeTruthy();
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });
});

describe("AuthPage", () => {
  it("mode masuk: mengirim data form dan berpindah ke daftar", () => {
    const onSubmit = vi.fn();
    const onSwitch = vi.fn();
    const { container } = render(
      <AuthPage mode="Masuk" onSubmit={onSubmit} onSwitch={onSwitch} />,
    );

    expect(screen.queryByLabelText(/Nama lengkap/)).toBeNull();

    fireEvent.change(container.querySelector("#username"), {
      target: { value: "  SARI@mail.com " },
    });
    fireEvent.change(container.querySelector("#password"), {
      target: { value: "rahasia123" },
    });
    fireEvent.submit(container.querySelector("form"));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "",
      email: "sari@mail.com",
      password: "rahasia123",
      confirmation: "",
    });

    fireEvent.click(screen.getByText("Daftar sekarang"));
    expect(onSwitch).toHaveBeenCalledWith("Daftar");
  });

  it("mode daftar: menampilkan kolom tambahan dan pindah ke masuk", () => {
    const onSwitch = vi.fn();
    const { container } = render(
      <AuthPage mode="Daftar" onSubmit={vi.fn()} onSwitch={onSwitch} />,
    );

    expect(container.querySelector("#name")).toBeTruthy();
    expect(container.querySelector("#confirmation")).toBeTruthy();
    expect(screen.getByText("Buat akun")).toBeTruthy();

    fireEvent.click(screen.getByText("Masuk", { selector: ".auth-switch button" }));
    expect(onSwitch).toHaveBeenCalledWith("Masuk");
  });

  it("menampilkan/menyembunyikan kata sandi", () => {
    const { container } = render(
      <AuthPage mode="Masuk" onSubmit={vi.fn()} onSwitch={vi.fn()} />,
    );
    const input = container.querySelector("#password");

    expect(input.type).toBe("password");
    fireEvent.click(screen.getByLabelText("Tampilkan kata sandi"));
    expect(input.type).toBe("text");
    fireEvent.click(screen.getByLabelText("Sembunyikan kata sandi"));
    expect(input.type).toBe("password");
  });

  it("menampilkan error dan tidak mengirim saat loading", () => {
    const onSubmit = vi.fn();
    const { container, rerender } = render(
      <AuthPage
        mode="Masuk"
        onSubmit={onSubmit}
        onSwitch={vi.fn()}
        error="Login gagal"
      />,
    );

    expect(screen.getByRole("alert").textContent).toBe("Login gagal");

    rerender(
      <AuthPage mode="Masuk" onSubmit={onSubmit} onSwitch={vi.fn()} loading />,
    );
    expect(screen.getByText("Memproses login...")).toBeTruthy();
    fireEvent.submit(container.querySelector("form"));
    expect(onSubmit).not.toHaveBeenCalled();

    rerender(
      <AuthPage mode="Daftar" onSubmit={onSubmit} onSwitch={vi.fn()} loading />,
    );
    expect(screen.getByText("Memproses pendaftaran...")).toBeTruthy();
  });
});
