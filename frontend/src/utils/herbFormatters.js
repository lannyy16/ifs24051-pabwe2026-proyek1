/** Fungsi pemformat data herbal agar tampil konsisten di seluruh UI. */

export function herbNameLatin(herb) {
  return (
    herb.scientificName ||
    herb.latin ||
    "Nama ilmiah belum tersedia"
  );
}

export function herbDescription(herb) {
  return (
    herb.description ||
    herb.desc ||
    "Belum ada deskripsi untuk tanaman ini."
  );
}

export function herbEmoji(herb) {
  return herb.emoji || "🌿";
}

/** Kategori herbal (field `category` atau `tag`); kosong jika tidak ada. */
export function herbCategory(herb) {
  return herb.category || herb.tag || "";
}

/** Label kategori untuk ditampilkan di UI. */
export function herbCategoryLabel(herb) {
  return herbCategory(herb) || "Herbal";
}
