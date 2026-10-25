import { trimTrailingSlashes } from "./url.js";

/** Nama halaman untuk path yang tidak dikenal. */
export const NOT_FOUND_PAGE = "Tidak Ditemukan";

export const ROUTES = {
  Beranda: "/",
  "Katalog Herbal": "/katalog",
  "Herbal Finder": "/finder",
  Artikel: "/artikel",
  Dashboard: "/dashboard",
  Masuk: "/auth/login",
  Daftar: "/auth/register",
};

const PATH_TO_PAGE = {
  "/": "Beranda",
  "/katalog": "Katalog Herbal",
  "/finder": "Herbal Finder",
  "/artikel": "Artikel",
  "/dashboard": "Dashboard",
  "/auth/login": "Masuk",
  "/auth/register": "Daftar",
  "/login": "Masuk",
  "/register": "Daftar",
};

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
