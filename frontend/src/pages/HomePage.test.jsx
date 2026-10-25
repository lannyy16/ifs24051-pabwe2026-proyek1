import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import HomePage from "./HomePage.jsx";

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
