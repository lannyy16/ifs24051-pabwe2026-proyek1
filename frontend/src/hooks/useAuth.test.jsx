import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import useAuth from "./useAuth.js";
import { TOKEN_KEY } from "../config/storageKeys.js";

function jsonResponse(body, ok = true, status = 200) {
  return { ok, status, json: async () => body };
}

describe("useAuth", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("menolak form yang tidak valid tanpa memanggil backend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useAuth());
    let success;

    await act(async () => {
      success = await result.current.submit(
        { email: "salah", password: "x" },
        false,
      );
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe("Masukkan alamat email yang valid.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("login berhasil menyimpan sesi dan pengguna", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          success: true,
          data: { user: { name: "Sari" }, token: "tok" },
        }),
      ),
    );

    const { result } = renderHook(() => useAuth());
    let success;

    await act(async () => {
      success = await result.current.submit(
        { email: "sari@mail.com", password: "rahasia" },
        false,
      );
    });

    expect(success).toBe(true);
    expect(result.current.user).toEqual({ name: "Sari" });
    expect(sessionStorage.getItem(TOKEN_KEY)).toBe("tok");
  });

  it("menampilkan pesan error saat login gagal", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ success: false, message: "Salah sandi" }, false, 401),
      ),
    );

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.submit(
        { email: "sari@mail.com", password: "rahasia" },
        false,
      );
    });

    expect(result.current.error).toBe("Salah sandi");
    expect(result.current.loading).toBe(false);
  });

  it("logout menghapus sesi", async () => {
    sessionStorage.setItem(TOKEN_KEY, "tok");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({ success: true, data: { user: { name: "Sari" } } }),
      ),
    );

    const { result } = renderHook(() => useAuth());

    await waitFor(() => expect(result.current.user).toEqual({ name: "Sari" }));

    act(() => result.current.logout());

    expect(result.current.user).toBeNull();
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
