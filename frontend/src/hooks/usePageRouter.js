import { useCallback, useEffect, useRef, useState } from "react";
import { ROUTES, pageFromPath } from "../utils/routes.js";

/**
 * Mengelola halaman aktif yang sinkron dengan URL browser
 * (pushState untuk navigasi, popstate untuk tombol back/forward).
 *
 * @param {() => void} [onPopState] Dipanggil setelah back/forward browser.
 * @returns {{ page: string, goTo: (nextPage: string) => void }}
 */
export default function usePageRouter(onPopState) {
  const [page, setPage] = useState(() =>
    pageFromPath(globalThis.location.pathname),
  );
  const popStateHandler = useRef(onPopState);

  useEffect(() => {
    popStateHandler.current = onPopState;
  }, [onPopState]);

  useEffect(() => {
    const handlePopState = () => {
      setPage(pageFromPath(globalThis.location.pathname));
      popStateHandler.current?.();
    };

    globalThis.addEventListener("popstate", handlePopState);

    return () => {
      globalThis.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const goTo = useCallback((nextPage) => {
    setPage(nextPage);

    const nextPath = ROUTES[nextPage] || "/";

    if (globalThis.location.pathname !== nextPath) {
      globalThis.history.pushState(null, "", nextPath);
    }

    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return { page, goTo };
}
