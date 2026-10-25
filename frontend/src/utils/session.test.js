import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSession,
  readSavedIds,
  readSessionUser,
  readToken,
  saveSession,
  saveSessionUser,
  writeSavedIds,
} from "./session.js";
import {
  SAVED_STORAGE_KEY,
  TOKEN_KEY,
  USER_STORAGE_KEY,
} from "../config/storageKeys.js";

describe("session", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("menyimpan dan membaca sesi pengguna", () => {
    saveSession({ name: "Sari" }, "token-1");

    expect(readSessionUser()).toEqual({ name: "Sari" });
    expect(readToken()).toBe("token-1");
  });

  it("menyimpan data pengguna saja", () => {
    saveSessionUser({ name: "Budi" });

    expect(readSessionUser()).toEqual({ name: "Budi" });
    expect(readToken()).toBe("");
  });

  it("mengembalikan null/kosong jika tidak ada sesi", () => {
    expect(readSessionUser()).toBeNull();
    expect(readToken()).toBe("");
  });

  it("mengembalikan null jika JSON pengguna rusak", () => {
    sessionStorage.setItem(USER_STORAGE_KEY, "{rusak");

    expect(readSessionUser()).toBeNull();
  });

  it("menghapus sesi", () => {
    saveSession({ name: "Sari" }, "token-1");
    clearSession();

    expect(sessionStorage.getItem(USER_STORAGE_KEY)).toBeNull();
    expect(sessionStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("mengabaikan error saat menghapus sesi", () => {
    vi.stubGlobal("sessionStorage", {
      removeItem: () => {
        throw new Error("tidak tersedia");
      },
    });

    expect(() => clearSession()).not.toThrow();
  });

  it("mengembalikan token kosong jika sessionStorage error", () => {
    vi.stubGlobal("sessionStorage", {
      getItem: () => {
        throw new Error("tidak tersedia");
      },
    });

    expect(readToken()).toBe("");
  });

  it("menyimpan dan membaca herbal favorit", () => {
    writeSavedIds([1, 2]);

    expect(readSavedIds()).toEqual([1, 2]);
  });

  it("mengembalikan array kosong untuk data favorit tidak valid", () => {
    expect(readSavedIds()).toEqual([]);

    localStorage.setItem(SAVED_STORAGE_KEY, '{"a":1}');
    expect(readSavedIds()).toEqual([]);

    localStorage.setItem(SAVED_STORAGE_KEY, "{rusak");
    expect(readSavedIds()).toEqual([]);
  });

  it("mengabaikan error saat menulis favorit", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("penuh");
      },
    });

    expect(() => writeSavedIds([1])).not.toThrow();
  });
});
