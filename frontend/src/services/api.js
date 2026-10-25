
export const TOKEN_KEY = "herbanusantara-token";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/+$/, "");

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
    ...customHeaders
  };

  // Tambahkan Content-Type jika request memiliki body.
  if (requestOptions.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Tambahkan token autentikasi.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestOptions,
      headers
    });
  } catch (error) {
    // Jangan mengubah AbortError menjadi Error biasa.
    if (error?.name === "AbortError") {
      throw error;
    }

    throw new Error(
      "Tidak dapat terhubung ke backend. Pastikan backend berjalan."
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
    throw new Error(
      data.message || "Request API gagal."
    );
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

  // Pencarian harus dipangkas terlebih dahulu.
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

  // Parameter tambahan yang bukan AbortSignal.
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

  // Signal diteruskan sebagai fetch option,
  // bukan sebagai parameter URL.
  const result = await apiRequest(endpoint, {
    method: "GET",
    ...(signal ? { signal } : {})
  });

  const herbs = result?.data;

  // Validasi data herbal.
  if (!Array.isArray(herbs)) {
    throw new TypeError(
      "Data herbal dari backend tidak valid."
    );
  }

  return herbs;
}
