import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Footer from "./Footer.jsx";

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
