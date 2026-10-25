
const API_ORIGIN = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");

const API_BASE_URL = API_ORIGIN.endsWith("/api")
  ? API_ORIGIN
  : `${API_ORIGIN}/api`;

export const TOKEN_KEY = "herbanusantara-token";

/**
 * Fungsi utama untuk request ke backend.
 * Digunakan untuk login, register, profile, dan endpoint lainnya.
 */
export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY);

  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Tidak dapat terhubung ke backend. Pastikan backend berjalan."
    );
  }

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Response backend tidak valid.");
  }

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message ||
        `Request gagal dengan status ${response.status}.`
    );
  }

  return result;
}

/**
 * Mengambil seluruh data herbal dari backend.
 * Digunakan oleh CatalogPage dan useHerbs.
 */
export async function getHerbs({
  search = "",
  signal,
} = {}) {
  const params = new URLSearchParams();

  const keyword = String(search || "").trim();

  if (keyword) {
    params.set("search", keyword);
  }

  const query = params.toString();

  const endpoint = query
    ? `/herbs?${query}`
    : "/herbs";

  const result = await apiRequest(endpoint, {
    method: "GET",
    signal,
  });

  if (!Array.isArray(result.data)) {
    throw new Error(
      "Data herbal dari backend tidak valid."
    );
  }

  return result.data;
}
