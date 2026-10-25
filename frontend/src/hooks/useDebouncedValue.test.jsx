import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useDebouncedValue from "./useDebouncedValue.js";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("mengembalikan nilai awal langsung", () => {
    const { result } = renderHook(() => useDebouncedValue("jahe", 300));

    expect(result.current).toBe("jahe");
  });

  it("baru berubah setelah jeda terlewati", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe("ab");
  });

  it("hanya memakai nilai terakhir saat berubah berulang kali", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: "" } },
    );

    rerender({ value: "k" });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: "ku" });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe("");

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("ku");
  });
});
