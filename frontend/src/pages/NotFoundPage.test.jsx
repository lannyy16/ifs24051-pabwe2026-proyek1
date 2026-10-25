import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import NotFoundPage from "./NotFoundPage.jsx";

describe("NotFoundPage", () => {
  it("menampilkan pesan dan kembali ke Beranda", () => {
    const onNavigate = vi.fn();
    render(<NotFoundPage onNavigate={onNavigate} />);

    expect(screen.getByText("Halaman tidak ditemukan")).toBeTruthy();

    fireEvent.click(screen.getByText("Kembali ke Beranda"));
    expect(onNavigate).toHaveBeenCalledWith("Beranda");
  });
});
