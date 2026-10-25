import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import DashboardPage from "./DashboardPage.jsx";

const herbs = [
  { id: 1, name: "Jahe", category: "Rimpang" },
  { id: 2, name: "Kemangi", category: "Daun" },
  { id: 3, name: "Pegagan", tag: "Daun" },
  { id: 4, name: "Misterius" },
];

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
