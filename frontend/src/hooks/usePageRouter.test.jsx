import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import usePageRouter from "./usePageRouter.js";

describe("usePageRouter", () => {
  beforeEach(() => {
    globalThis.history.replaceState(null, "", "/katalog");
    globalThis.scrollTo = vi.fn();
  });

  it("membaca halaman awal dari URL", () => {
    const { result } = renderHook(() => usePageRouter());

    expect(result.current.page).toBe("Katalog Herbal");
  });

  it("berpindah halaman dan memperbarui URL", () => {
    const { result } = renderHook(() => usePageRouter());

    act(() => result.current.goTo("Artikel"));

    expect(result.current.page).toBe("Artikel");
    expect(globalThis.location.pathname).toBe("/artikel");
    expect(globalThis.scrollTo).toHaveBeenCalled();
  });

  it("menyinkronkan halaman saat tombol back/forward ditekan", () => {
    const onPopState = vi.fn();
    const { result } = renderHook(() => usePageRouter(onPopState));

    globalThis.history.replaceState(null, "", "/finder");
    act(() => {
      globalThis.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(result.current.page).toBe("Herbal Finder");
    expect(onPopState).toHaveBeenCalledTimes(1);
  });
});
