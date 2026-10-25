import { trimTrailingSlashes } from "./url.js";

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
 *
 * @param {string} pathname
 * @returns {string}
 */
export function pageFromPath(pathname) {
  const cleanPath =
    trimTrailingSlashes((pathname || "/").toLowerCase()) || "/";

  return PATH_TO_PAGE[cleanPath] || "Beranda";
}
