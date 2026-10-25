
import { useEffect, useState } from "react";
import { getHerbs } from "../services/herbService.js";

export default function useHerbs(search = "", reloadKey = 0) {
  const [herbs, setHerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHerbs() {
      setLoading(true);
      setError("");

      try {
        const data = await getHerbs({
          search,
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setHerbs(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (err?.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat memuat tanaman."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHerbs();

    return () => {
      controller.abort();
    };
  }, [search, reloadKey]);

  return {
    herbs,
    loading,
    error,
  };
}
