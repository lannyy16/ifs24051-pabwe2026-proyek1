import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useHerbs from "./useHerbs.js";
import { getHerbs } from "../services/herbService.js";

vi.mock("../services/herbService.js", () => ({
  getHerbs: vi.fn(),
}));

describe("useHerbs", () => {
  beforeEach(() => {
    getHerbs.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("memuat data herbal", async () => {
    getHerbs.mockResolvedValue([{ id: 1 }]);

    const { result } = renderHook(() => useHerbs("jahe"));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.herbs).toEqual([{ id: 1 }]);
    expect(result.current.error).toBe("");
    expect(getHerbs).toHaveBeenCalledWith(
      expect.objectContaining({ search: "jahe" }),
    );
  });

  it("menggunakan array kosong jika data bukan array", async () => {
    getHerbs.mockResolvedValue(null);

    const { result } = renderHook(() => useHerbs());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.herbs).toEqual([]);
  });

  it("menyimpan pesan error", async () => {
    getHerbs.mockRejectedValue(new Error("Gagal total"));

    const { result } = renderHook(() => useHerbs());
    await waitFor(() => expect(result.current.error).toBe("Gagal total"));

    expect(result.current.loading).toBe(false);
  });

  it("memakai pesan cadangan untuk error non-Error", async () => {
    getHerbs.mockRejectedValue("aneh");

    const { result } = renderHook(() => useHerbs());
    await waitFor(() =>
      expect(result.current.error).toBe(
        "Terjadi kesalahan saat memuat tanaman.",
      ),
    );
  });

  it("mengabaikan AbortError", async () => {
    const abortError = new Error("dibatalkan");
    abortError.name = "AbortError";
    getHerbs.mockRejectedValue(abortError);

    const { result } = renderHook(() => useHerbs());
    await waitFor(() => expect(getHerbs).toHaveBeenCalled());

    expect(result.current.error).toBe("");
  });

  it("membatalkan request saat di-unmount", async () => {
    let signal;
    getHerbs.mockImplementation(({ signal: received }) => {
      signal = received;
      return new Promise(() => {});
    });

    const { unmount } = renderHook(() => useHerbs());
    await waitFor(() => expect(signal).toBeDefined());

    unmount();
    expect(signal.aborted).toBe(true);
  });

  it("memuat ulang saat reloadKey berubah", async () => {
    getHerbs.mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ key }) => useHerbs("", key),
      { initialProps: { key: 0 } },
    );
    await waitFor(() => expect(getHerbs).toHaveBeenCalledTimes(1));

    rerender({ key: 1 });
    await waitFor(() => expect(getHerbs).toHaveBeenCalledTimes(2));
  });
});
