import { afterEach, describe, expect, it, vi } from "vitest";

async function loadEnvModule() {
  vi.resetModules();

  return import("./env.js");
}

describe("config/env", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("memakai VITE_API_URL dan membuang garis miring di akhir", async () => {
    vi.stubEnv("VITE_API_URL", "http://localhost:3000/api//");

    const { API_BASE_URL } = await loadEnvModule();

    expect(API_BASE_URL).toBe("http://localhost:3000/api");
  });

  it("memakai URL bawaan jika VITE_API_URL kosong", async () => {
    vi.stubEnv("VITE_API_URL", "");

    const { API_BASE_URL, DEFAULT_API_URL } = await loadEnvModule();

    expect(API_BASE_URL).toBe(DEFAULT_API_URL);
  });
});
