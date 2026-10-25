import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary.jsx";

let shouldThrow = true;

function Bomb() {
  if (shouldThrow) {
    throw new Error("meledak");
  }

  return <p>Aman</p>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    shouldThrow = true;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("menampilkan anak jika tidak ada error", () => {
    shouldThrow = false;
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Aman")).toBeTruthy();
  });

  it("menampilkan pesan cadangan saat anak melempar error", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Halaman tidak dapat ditampilkan")).toBeTruthy();
  });

  it("dapat dicoba lagi setelah masalah teratasi", () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    shouldThrow = false;
    fireEvent.click(screen.getByText("Coba lagi"));

    expect(screen.getByText("Aman")).toBeTruthy();
  });
});
