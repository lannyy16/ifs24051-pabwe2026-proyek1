import { trimTrailingSlashes } from "../utils/url.js";

/**
 * URL backend yang dipakai bila VITE_API_URL tidak diisi saat build
 * (misalnya pada deploy otomatis). Sudah termasuk awalan "/api".
 */
export const DEFAULT_API_URL =
  "https://ifs24051-pabwe2026-proyek1-backend.vercel.app/api";

/**
 * Base URL API. Atur lewat variabel lingkungan `VITE_API_URL`,
 * contoh: http://localhost:3000/api untuk development lokal.
 */
export const API_BASE_URL = trimTrailingSlashes(
  import.meta.env.VITE_API_URL || DEFAULT_API_URL,
);
