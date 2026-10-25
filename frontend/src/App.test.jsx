import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import App from "./App.jsx";
import { SAVED_STORAGE_KEY, TOKEN_KEY } from "./config/storageKeys.js";

const HERBS = [
  { id: 1, name: "Jahe", category: "Rimpang", description: "Hangat." },
  { id: 2, name: "Kemangi", category: "Daun" },
  { id: 3, name: "Kunyit", category: "Rimpang" },
];

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

/** Router fetch palsu: daftar herbal + endpoint autentikasi. */
function installFetch(overrides = {}) {
  const fetchMock = vi.fn(async (url, options = {}) => {
    const target = String(url);
    const key = `${options.method || "GET"} ${new URL(target).pathname}`;

    if (overrides[key]) {
      return overrides[key](options);
    }

    if (target.includes("/api/herbs")) {
      return jsonResponse({ success: true, data: HERBS });
    }

    return jsonResponse({ success: false, message: "tidak ada" }, false, 404);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function openPage(name) {
  fireEvent.click(screen.getByText(name, { selector: "nav button" }));
}

function fillAuth(container, { name, email, password, confirmation }) {
  const set = (selector, value) => {
    const input = container.querySelector(selector);
    if (input && value !== undefined) {
      fireEvent.change(input, { target: { value } });
    }
  };

  set("#name", name);
  set("#username", email);
  set("#password", password);
  set("#confirmation", confirmation);
  fireEvent.submit(container.querySelector("form"));
}

describe("App", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    globalThis.history.replaceState(null, "", "/");
    globalThis.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("menampilkan beranda dan data herbal", async () => {
    installFetch();
    render(<App />);

    expect(await screen.findByText("Temukan herbal pilihan")).toBeTruthy();
    expect(await screen.findByLabelText("Lihat profil Jahe")).toBeTruthy();
  });

  it("membuka halaman sesuai URL awal", () => {
    installFetch();
    globalThis.history.replaceState(null, "", "/artikel");
    render(<App />);

    expect(screen.getByText("Artikel herbal")).toBeTruthy();
  });

  it("menavigasi antar halaman dan memperbarui URL", async () => {
    installFetch();
    render(<App />);

    openPage("Artikel");
    expect(screen.getByText("Artikel herbal")).toBeTruthy();
    expect(globalThis.location.pathname).toBe("/artikel");

    openPage("Herbal Finder");
    expect(screen.getByText("Informasi berdasarkan topik")).toBeTruthy();

    openPage("Dashboard");
    expect(screen.getByText("Ruang herbal saya")).toBeTruthy();

    openPage("Beranda");
    expect(globalThis.location.pathname).toBe("/");
    await screen.findByLabelText("Lihat profil Jahe");
  });

  it("merespons tombol back/forward browser", async () => {
    installFetch();
    render(<App />);

    globalThis.history.pushState(null, "", "/finder");
    globalThis.dispatchEvent(new PopStateEvent("popstate"));

    expect(await screen.findByText("Informasi berdasarkan topik")).toBeTruthy();
  });

  it("menampilkan halaman 404 untuk alamat tidak dikenal", async () => {
    installFetch();
    globalThis.history.replaceState(null, "", "/tidak-ada");
    render(<App />);

    expect(await screen.findByText("Halaman tidak ditemukan")).toBeTruthy();

    fireEvent.click(screen.getByText("Kembali ke Beranda", { selector: "main button" }));
    expect(globalThis.location.pathname).toBe("/");
  });

  it("Finder mengarahkan ke katalog dengan kata kunci", async () => {
    const fetchMock = installFetch();
    render(<App />);

    openPage("Herbal Finder");
    fireEvent.click(screen.getByText("Mual ringan"));

    expect(await screen.findByText("Jelajahi tanaman herbal")).toBeTruthy();
    expect(screen.getByLabelText("Cari tanaman herbal").value).toBe("jahe");
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) => String(url).includes("search=jahe")),
      ).toBe(true),
    );
  });

  it("memfilter katalog dari kategori beranda", async () => {
    installFetch();
    render(<App />);

    await screen.findByLabelText("Lihat profil Jahe");
    fireEvent.click(screen.getByText("Rimpang", { selector: ".cat b" }));

    expect(screen.getByText("Jelajahi tanaman herbal")).toBeTruthy();
    await screen.findByLabelText("Lihat profil Kunyit");
    expect(screen.queryByLabelText("Lihat profil Kemangi")).toBeNull();
  });

  it("mengganti kategori dan mencari di katalog", async () => {
    installFetch();
    render(<App />);

    openPage("Katalog Herbal");
    await screen.findByLabelText("Lihat profil Kemangi");

    fireEvent.click(screen.getByText("Daun", { selector: "button" }));
    expect(screen.queryByLabelText("Lihat profil Jahe")).toBeNull();

    fireEvent.change(screen.getByLabelText("Cari tanaman herbal"), {
      target: { value: "kem" },
    });
    expect(screen.getByLabelText("Cari tanaman herbal").value).toBe("kem");
  });

  it("menampilkan error katalog dan mencoba lagi", async () => {
    let attempts = 0;
    installFetch();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        attempts += 1;
        return attempts === 1
          ? jsonResponse({}, false, 500)
          : jsonResponse({ success: true, data: HERBS });
      }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(<App />);
    openPage("Katalog Herbal");

    fireEvent.click(await screen.findByText("Coba lagi"));
    expect(await screen.findByLabelText("Lihat profil Jahe")).toBeTruthy();
  });

  it("membuka detail herbal, menyimpan favorit, lalu kembali", async () => {
    installFetch();
    render(<App />);

    openPage("Katalog Herbal");
    fireEvent.click(await screen.findByLabelText("Lihat profil Jahe"));

    expect(screen.getByText("ENSIKLOPEDIA HERBAL")).toBeTruthy();
    fireEvent.click(screen.getByText("Simpan herbal"));
    expect(screen.getByText("Tersimpan")).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY))).toEqual([1]);

    fireEvent.click(screen.getByText("Tersimpan"));
    expect(screen.getByText("Simpan herbal")).toBeTruthy();

    fireEvent.click(screen.getByText("Kembali ke katalog"));
    expect(screen.getByText("Jelajahi tanaman herbal")).toBeTruthy();
  });

  it("menampilkan favorit di dashboard", async () => {
    localStorage.setItem(SAVED_STORAGE_KEY, "[2]");
    installFetch();
    render(<App />);

    openPage("Dashboard");
    expect(await screen.findByLabelText("Lihat profil Kemangi")).toBeTruthy();
  });

  it("menolak form login yang tidak valid", () => {
    installFetch();
    const { container } = render(<App />);

    fireEvent.click(screen.getByText("Masuk", { selector: ".nav-auth button" }));
    fillAuth(container, { email: "salah", password: "x" });

    expect(screen.getByRole("alert").textContent).toBe(
      "Masukkan alamat email yang valid.",
    );
  });

  it("login berhasil menyimpan sesi dan membuka dashboard", async () => {
    installFetch({
      "POST /api/auth/login": () =>
        jsonResponse({
          success: true,
          data: { user: { name: "Sari" }, token: "tok" },
        }),
    });
    const { container } = render(<App />);

    fireEvent.click(screen.getByText("Masuk", { selector: ".nav-auth button" }));
    fillAuth(container, { email: "sari@mail.com", password: "rahasia123" });

    expect(await screen.findByText("Halo, Sari")).toBeTruthy();
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe("tok");
    expect(globalThis.location.pathname).toBe("/dashboard");
  });

  it("login gagal menampilkan pesan dari server", async () => {
    installFetch({
      "POST /api/auth/login": () =>
        jsonResponse({ message: "Email atau sandi salah" }, false, 401),
    });
    const { container } = render(<App />);

    fireEvent.click(screen.getByText("Masuk", { selector: ".nav-auth button" }));
    fillAuth(container, { email: "sari@mail.com", password: "rahasia123" });

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Email atau sandi salah",
    );
  });

  it("registrasi berhasil membuka dashboard", async () => {
    installFetch({
      "POST /api/auth/register": () =>
        jsonResponse({
          success: true,
          data: { user: { name: "Budi" }, token: "tok2" },
        }),
    });
    const { container } = render(<App />);

    fireEvent.click(screen.getByText("Daftar", { selector: ".nav-auth button" }));
    fillAuth(container, {
      name: "Budi",
      email: "budi@mail.com",
      password: "rahasia123",
      confirmation: "rahasia123",
    });

    expect(await screen.findByText("Halo, Budi")).toBeTruthy();
  });

  it("registrasi gagal dengan error non-standar memakai pesan cadangan", async () => {
    installFetch({
      "POST /api/auth/register": () =>
        jsonResponse({ success: true, data: {} }),
    });
    const { container } = render(<App />);

    fireEvent.click(screen.getByText("Daftar", { selector: ".nav-auth button" }));
    fillAuth(container, {
      name: "Budi",
      email: "budi@mail.com",
      password: "rahasia123",
      confirmation: "rahasia123",
    });

    expect((await screen.findByRole("alert")).textContent).toContain(
      "tidak lengkap",
    );
  });

  it("memulihkan sesi dari token yang valid", async () => {
    sessionStorage.setItem(TOKEN_KEY, "tok");
    installFetch({
      "GET /api/auth/me": () =>
        jsonResponse({ success: true, data: { user: { name: "Sari" } } }),
    });
    render(<App />);

    expect(await screen.findByText("Keluar")).toBeTruthy();
  });

  it("menghapus sesi jika token tidak lagi valid", async () => {
    sessionStorage.setItem(TOKEN_KEY, "kadaluarsa");
    installFetch({
      "GET /api/auth/me": () =>
        jsonResponse({ message: "Token tidak valid" }, false, 401),
    });
    render(<App />);

    await waitFor(() => expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull());
    expect(screen.getByText("Masuk", { selector: ".nav-auth button" })).toBeTruthy();
  });

  it("logout menghapus sesi dan kembali ke beranda", async () => {
    sessionStorage.setItem(TOKEN_KEY, "tok");
    installFetch({
      "GET /api/auth/me": () =>
        jsonResponse({ success: true, data: { user: { name: "Sari" } } }),
    });
    render(<App />);

    fireEvent.click(await screen.findByText("Keluar"));

    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(globalThis.location.pathname).toBe("/");
    expect(screen.getByText("Masuk", { selector: ".nav-auth button" })).toBeTruthy();
  });

  it("berpindah antara halaman masuk dan daftar", () => {
    installFetch();
    render(<App />);

    fireEvent.click(screen.getByText("Masuk", { selector: ".nav-auth button" }));
    fireEvent.click(screen.getByText("Daftar sekarang"));
    expect(screen.getByText("Buat akun")).toBeTruthy();
  });

  it("tombol footer kembali ke beranda", () => {
    installFetch();
    globalThis.history.replaceState(null, "", "/artikel");
    render(<App />);

    fireEvent.click(screen.getByText("Kembali ke Beranda"));
    expect(globalThis.location.pathname).toBe("/");
  });
});
