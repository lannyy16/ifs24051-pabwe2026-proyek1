import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useSavedHerbs from "./useSavedHerbs.js";
import { SAVED_STORAGE_KEY } from "../config/storageKeys.js";

describe("useSavedHerbs", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("membaca daftar tersimpan dari localStorage", () => {
    localStorage.setItem(SAVED_STORAGE_KEY, "[2]");

    const { result } = renderHook(() => useSavedHerbs());

    expect(result.current.savedIds).toEqual([2]);
  });

  it("menambah dan menghapus herbal favorit", () => {
    const { result } = renderHook(() => useSavedHerbs());

    act(() => result.current.toggleSaved(1));
    expect(result.current.savedIds).toEqual([1]);
    expect(JSON.parse(localStorage.getItem(SAVED_STORAGE_KEY))).toEqual([1]);

    act(() => result.current.toggleSaved(1));
    expect(result.current.savedIds).toEqual([]);
  });
});
