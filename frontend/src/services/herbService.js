
const API_BASE_URL =
  "https://ifs24051-pabwe2026-proyek1-backend.vercel.app";

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

  // Mengubah pencarian menjadi string dan memangkas spasi.
  const keyword = String(search).trim();

  // Menambahkan parameter pencarian jika tersedia.
  if (keyword) {
    params.set("search", keyword);
  }

  const query = params.toString();

  // Membuat URL request.
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

    // Menangani HTTP error.
    if (!response.ok) {
      throw new Error(
        `Gagal mengambil data herbal (HTTP ${response.status}).`
      );
    }

    // Membaca response JSON.
    const result = await response.json();

    // Validasi format response.
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
    // AbortError diteruskan tanpa diubah.
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    console.error("Herb API Error:", error);

    // Menangani error berupa Error maupun nilai lainnya.
    throw new Error(
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat mengambil data herbal."
    );
  }
}
