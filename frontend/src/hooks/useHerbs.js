import { useEffect, useState } from "react";
import { getHerbs } from "../services/herbService.js";

export default function useHerbs(search = "", reloadKey = 0) {
  const [herbs, setHerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getHerbs({ search, signal: controller.signal });
        if (active) setHerbs(data);
      } catch (err) {
        if (active && err?.name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat tanaman.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [search, reloadKey]);

  return { herbs, loading, error };
}
