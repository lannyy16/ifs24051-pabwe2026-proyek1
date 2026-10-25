import { useCallback, useEffect, useState } from "react";
import { readSavedIds, writeSavedIds } from "../utils/session.js";

/**
 * Menyimpan id herbal favorit dan menyinkronkannya ke localStorage.
 *
 * @returns {{ savedIds: Array<string|number>, toggleSaved: (id: string|number) => void }}
 */
export default function useSavedHerbs() {
  const [savedIds, setSavedIds] = useState(readSavedIds);

  useEffect(() => {
    writeSavedIds(savedIds);
  }, [savedIds]);

  const toggleSaved = useCallback((id) => {
    setSavedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }, []);

  return { savedIds, toggleSaved };
}
