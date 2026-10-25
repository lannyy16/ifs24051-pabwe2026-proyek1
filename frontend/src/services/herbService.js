import { apiRequest } from "./api.js";
import { buildQueryString } from "../utils/url.js";

/**
 * Mengambil daftar herbal dari backend.
 *
 * @param {object} params
 * @param {string} [params.search] Kata kunci pencarian.
 * @param {AbortSignal} [params.signal] Signal untuk membatalkan request.
 * @returns {Promise<Array>}
 */
export async function getHerbs(params = {}) {
  const { signal, ...queryParams } = params;

  const queryString = buildQueryString(queryParams);
  const endpoint = queryString ? `/herbs?${queryString}` : "/herbs";

  // Signal diteruskan ke fetch, bukan ke URL.
  const result = await apiRequest(endpoint, {
    method: "GET",
    ...(signal ? { signal } : {}),
  });

  const herbs = result?.data;

  if (!Array.isArray(herbs)) {
    throw new TypeError("Data herbal dari backend tidak valid.");
  }

  return herbs;
}
