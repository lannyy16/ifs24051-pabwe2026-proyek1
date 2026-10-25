import { trimTrailingSlashes } from "./url.js";

/** Satu-satunya definisi nama halaman; pakai konstanta ini, bukan string. */
export const PAGES = Object.freeze({
  HOME: "Beranda",
  CATALOG: "Katalog Herbal",
  FINDER: "Herbal Finder",
  ARTICLES: "Artikel",
  DASHBOARD: "Dashboard",
  LOGIN: "Masuk",
  REGISTER: "Daftar",
  NOT_FOUND: "Tidak Ditemukan",
});

/** Nama halaman untuk path yang tidak dikenal. */
export const NOT_FOUND_PAGE = PAGES.NOT_FOUND;

/** Path utama setiap halaman. */
export const ROUTES = Object.freeze({
  [PAGES.HOME]: "/",
  [PAGES.CATALOG]: "/katalog",
  [PAGES.FINDER]: "/finder",
  [PAGES.ARTICLES]: "/artikel",
  [PAGES.DASHBOARD]: "/dashboard",
  [PAGES.LOGIN]: "/auth/login",
  [PAGES.REGISTER]: "/auth/register",
});

/** Path alternatif yang tetap diterima. */
const ROUTE_ALIASES = Object.freeze({
  "/login": PAGES.LOGIN,
  "/register": PAGES.REGISTER,
});

const PATH_TO_PAGE = Object.freeze({
  ...Object.fromEntries(
    Object.entries(ROUTES).map(([page, path]) => [path, page]),
  ),
  ...ROUTE_ALIASES,
});

/**
 * Mengubah path URL menjadi nama halaman.
 * Path kosong dianggap Beranda; path tidak dikenal menjadi NOT_FOUND_PAGE.
 *
 * @param {string} pathname
 * @returns {string}
 */
export function pageFromPath(pathname) {
  const cleanPath =
    trimTrailingSlashes((pathname || "/").toLowerCase()) || "/";

  return PATH_TO_PAGE[cleanPath] || NOT_FOUND_PAGE;
}
