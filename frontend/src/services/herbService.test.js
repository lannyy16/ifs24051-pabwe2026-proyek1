import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

import { getHerbs } from "./herbService.js";
import { API_BASE_URL as API_URL } from "../config/env.js";

function mockSuccess(data = { success: true }) {
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => data,
  });
}

describe("getHerbs", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn().mockReturnValue(null),
    });

    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("mengambil daftar herbal tanpa parameter pencarian", async () => {
    const herbs = [{ id: 1, name: "Jahe" }];
    mockSuccess({ success: true, data: herbs });

    await expect(getHerbs()).resolves.toEqual(herbs);

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("menambahkan parameter pencarian setelah spasi dipangkas", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({ search: "  jahe  " });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs?search=jahe`,
      expect.any(Object),
    );
  });

  it("tidak menambahkan parameter jika pencarian hanya spasi", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({ search: "   " });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs`,
      expect.any(Object),
    );
  });

  it("mengodekan karakter khusus pada pencarian", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({ search: "jahe & kunyit" });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs?search=jahe+%26+kunyit`,
      expect.any(Object),
    );
  });

  it("menerima pencarian berupa angka dan mengubahnya menjadi string", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({ search: 123 });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs?search=123`,
      expect.any(Object),
    );
  });

  it("menambahkan parameter tambahan yang valid", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({
      category: "rempah",
      page: 2,
      ignoredUndefined: undefined,
      ignoredNull: null,
      ignoredEmpty: "",
    });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs?category=rempah&page=2`,
      expect.any(Object),
    );
  });

  it("mengabaikan pencarian null dan kosong", async () => {
    mockSuccess({ success: true, data: [] });

    await getHerbs({ search: null });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs`,
      expect.any(Object),
    );
  });

  it("meneruskan AbortSignal ke request", async () => {
    const controller = new AbortController();
    mockSuccess({ success: true, data: [] });

    await getHerbs({ signal: controller.signal });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/herbs`,
      expect.objectContaining({
        signal: controller.signal,
      }),
    );
  });

  it("meneruskan error HTTP dari backend", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "Server error" }),
    });

    await expect(getHerbs()).rejects.toThrow("Server error");
  });

  it("melempar error jika data herbal bukan array", async () => {
    mockSuccess({
      success: true,
      data: { name: "Jahe" },
    });

    await expect(getHerbs()).rejects.toThrow(
      "Data herbal dari backend tidak valid.",
    );
  });

  it("menolak respons null", async () => {
    mockSuccess(null);

    await expect(getHerbs()).rejects.toThrow(
      "Data herbal dari backend tidak valid.",
    );
  });

  it("menolak respons tanpa data", async () => {
    mockSuccess({ success: true });

    await expect(getHerbs()).rejects.toThrow(
      "Data herbal dari backend tidak valid.",
    );
  });
});
