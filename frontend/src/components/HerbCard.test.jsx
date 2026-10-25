import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import HerbCard from "./HerbCard.jsx";

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
