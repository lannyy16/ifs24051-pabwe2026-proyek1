const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const API_URL = `${API_BASE_URL}/api/herbs`;

/** Mengambil katalog herbal dari backend. */
export async function getHerbs({ search = "", signal } = {}) {
  const params = new URLSearchParams();
  const keyword = search.trim();
  if (keyword) params.set("search", keyword);

  const query = params.toString();
  const url = query ? `${API_URL}?${query}` : API_URL;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data tanaman (HTTP ${response.status}).`);
  }

  const result = await response.json();
  if (result?.success !== true || !Array.isArray(result?.data)) {
    throw new Error("Format data dari server tidak valid.");
  }
  return result.data;
}
