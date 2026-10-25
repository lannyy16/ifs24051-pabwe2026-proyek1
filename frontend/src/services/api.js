import { API_BASE_URL } from "../config/env.js";
import { TOKEN_KEY } from "../config/storageKeys.js";

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
