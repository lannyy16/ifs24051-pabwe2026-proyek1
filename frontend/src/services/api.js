export const TOKEN_KEY = "herbanusantara-token";

/**
 * Menghapus garis miring di akhir teks tanpa regex
 * (menghindari backtracking pada input panjang).
 *
 * @param {string} value
 * @returns {string}
 */
export function trimTrailingSlashes(value) {
  let end = value.length;

  while (end > 0 && value[end - 1] === "/") {
    end -= 1;
  }

  return value.slice(0, end);
}

const API_BASE_URL = trimTrailingSlashes(
  import.meta.env.VITE_API_URL || "http://localhost:3000/api",
);

/**
 * Mengambil token autentikasi dari sessionStorage.
 */
function getAuthToken() {
  try {
    return globalThis.sessionStorage?.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * Mengirim request ke backend.
 *
 * @param {string} endpoint
 * @param {object} options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
  const {
    headers: customHeaders = {},
    ...requestOptions
  } = options;

  const token = getAuthToken();

  const headers = {
    Accept: "application/json",
    ...customHeaders,
  };

  // Periksa Content-Type tanpa membedakan huruf besar/kecil.
  const hasContentType = Object.keys(headers).some(
    (key) => key.toLowerCase() === "content-type",
  );

  // Tambahkan Content-Type jika request memiliki body.
  if (requestOptions.body != null && !hasContentType) {
    headers["Content-Type"] = "application/json";
  }

  // Tambahkan token autentikasi jika tersedia.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers,
    });
  } catch (error) {
    // Jangan mengubah AbortError menjadi Error biasa.
    if (error?.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Tidak dapat terhubung ke backend. Pastikan backend berjalan.",
    );
  }

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Response backend tidak valid.");
  }

  // Periksa status HTTP.
  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      `Request gagal dengan status ${response.status}.`;

    throw new Error(message);
  }

  // Periksa status keberhasilan dari backend.
  if (data?.success === false) {
    throw new Error(data.message || "Request API gagal.");
  }

  return data;
}

/**
 * Mengambil daftar herbal dari backend.
 *
 * @param {object} params
 * @returns {Promise<Array>}
 */
export async function getHerbs(params = {}) {
  const {
    search = "",
    signal,
    ...otherParams
  } = params;

  const query = new URLSearchParams();

  // Pangkas spasi pada pencarian berbentuk string.
  const trimmedSearch =
    typeof search === "string"
      ? search.trim()
      : search;

  if (
    trimmedSearch !== undefined &&
    trimmedSearch !== null &&
    trimmedSearch !== ""
  ) {
    query.set("search", String(trimmedSearch));
  }

  // Tambahkan parameter tambahan yang memiliki nilai.
  Object.entries(otherParams).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();

  const endpoint = queryString
    ? `/herbs?${queryString}`
    : "/herbs";

  // Signal diteruskan ke fetch, bukan ke URL.
  const result = await apiRequest(endpoint, {
    method: "GET",
    ...(signal ? { signal } : {}),
  });

  const herbs = result?.data;

  // Validasi data herbal.
  if (!Array.isArray(herbs)) {
    throw new TypeError(
      "Data herbal dari backend tidak valid.",
    );
  }

  return herbs;
}
