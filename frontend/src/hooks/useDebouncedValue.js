import { useEffect, useState } from "react";

/**
 * Mengembalikan nilai yang baru berubah setelah `delay` ms tanpa perubahan.
 * Dipakai agar pencarian tidak memanggil API pada setiap ketikan.
 *
 * @template T
 * @param {T} value
 * @param {number} delay
 * @returns {T}
 */
export default function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
