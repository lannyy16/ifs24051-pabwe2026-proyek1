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

function isPresent(value) {
  return value !== undefined && value !== null && value !== "";
}

/**
 * Membuat query string dari objek parameter.
 * Nilai kosong (undefined, null, "") dan string berisi spasi saja diabaikan.
 *
 * @param {Record<string, unknown>} params
 * @returns {string} Query string tanpa tanda tanya di depan.
 */
export function buildQueryString(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const cleanValue = typeof value === "string" ? value.trim() : value;

    if (isPresent(cleanValue)) {
      query.set(key, String(cleanValue));
    }
  });

  return query.toString();
}
