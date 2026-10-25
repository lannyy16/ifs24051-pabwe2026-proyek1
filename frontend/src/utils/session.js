import {
  SAVED_STORAGE_KEY,
  TOKEN_KEY,
  USER_STORAGE_KEY,
} from "../config/storageKeys.js";

export function readSessionUser() {
  try {
    const value = globalThis.sessionStorage.getItem(USER_STORAGE_KEY);

    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function readToken() {
  try {
    return globalThis.sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function readSavedIds() {
  try {
    const value = JSON.parse(
      globalThis.localStorage.getItem(SAVED_STORAGE_KEY) || "[]",
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeSavedIds(ids) {
  try {
    globalThis.localStorage.setItem(
      SAVED_STORAGE_KEY,
      JSON.stringify(ids),
    );
  } catch {
    // Penyimpanan lokal mungkin tidak tersedia.
  }
}

export function saveSession(user, token) {
  globalThis.sessionStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(user),
  );

  globalThis.sessionStorage.setItem(TOKEN_KEY, token);
}

export function saveSessionUser(user) {
  globalThis.sessionStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(user),
  );
}

export function clearSession() {
  try {
    globalThis.sessionStorage.removeItem(USER_STORAGE_KEY);
    globalThis.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Penyimpanan sesi mungkin tidak tersedia.
  }
}
