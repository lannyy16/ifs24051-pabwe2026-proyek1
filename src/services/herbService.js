
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "https://ifs24051-pabwe2026-proyek1-backend.vercel.app"
).replace(/\/+$/, "");

const API_URL = `${API_BASE_URL}/api/herbs`;

/**
 * Mengambil katalog herbal dari backend.
 *
 * @param {Object} options
 * @param {string} options.search
 * @param {AbortSignal} options.signal
 * @returns {Promise<Array>}
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

  const url = query
    ? `${API_URL}?${query}`
    : API_URL;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(
        `Gagal mengambil data herbal (HTTP ${response.status}).`
      );
    }

    const result = await response.json();

    if (
      !result ||
      result.success !== true ||
      !Array.isArray(result.data)
    ) {
      throw new Error(
        "Format data herbal dari server tidak valid."
      );
    }

    return result.data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error;
    }

    console.error("Herb API Error:", error);

    throw new Error(
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat mengambil data herbal."
    );
  }
}
