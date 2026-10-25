import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Navbar from "./Navbar.jsx";

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
