import { useEffect } from "react";

/**
 * Memanggil `handler` saat tombol Escape ditekan.
 *
 * @param {() => void} handler
 */
export default function useEscapeKey(handler) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        handler();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handler]);
}
