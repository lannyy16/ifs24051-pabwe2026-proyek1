import { useEffect } from "react";
import { APP_TITLE } from "../config/constants.js";
import { PAGES } from "../utils/routes.js";

/**
 * Menyesuaikan judul tab browser dengan halaman yang sedang dibuka.
 *
 * @param {string} page Nama halaman; Beranda memakai judul dasar saja.
 */
export default function useDocumentTitle(page) {
  useEffect(() => {
    document.title =
      page && page !== PAGES.HOME ? `${page} — ${APP_TITLE}` : APP_TITLE;
  }, [page]);
}
