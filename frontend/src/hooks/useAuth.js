import { useCallback, useEffect, useState } from "react";
import {
  fetchCurrentUser,
  getAuthError,
  loginUser,
  registerUser,
  validateAuthForm,
} from "../services/authService.js";
import {
  clearSession,
  readSessionUser,
  readToken,
  saveSession,
  saveSessionUser,
} from "../utils/session.js";

const FALLBACK_ERRORS = {
  register: "Registrasi gagal. Silakan coba lagi.",
  login: "Login gagal. Silakan coba lagi.",
};

/**
 * Mengelola state autentikasi: pengguna aktif, pemulihan sesi,
 * login/registrasi, dan logout.
 */
export default function useAuth() {
  const [user, setUser] = useState(readSessionUser);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pulihkan sesi pengguna dari token yang tersimpan.
  useEffect(() => {
    if (!readToken()) {
      setUser(null);
      return undefined;
    }

    let cancelled = false;

    async function restoreSession() {
      try {
        const authenticatedUser = await fetchCurrentUser();

        if (cancelled) {
          return;
        }

        setUser(authenticatedUser);
        saveSessionUser(authenticatedUser);
      } catch {
        if (cancelled) {
          return;
        }

        clearSession();
        setUser(null);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  /**
   * Memvalidasi lalu mengirim form login/registrasi.
   *
   * @returns {Promise<boolean>} true jika autentikasi berhasil.
   */
  const submit = useCallback(async (form, isRegister) => {
    setError("");

    const validatedForm = validateAuthForm(form, isRegister);

    if (validatedForm.error) {
      setError(validatedForm.error);
      return false;
    }

    setLoading(true);

    try {
      const authResult = isRegister
        ? await registerUser(validatedForm)
        : await loginUser(validatedForm);

      saveSession(authResult.authenticatedUser, authResult.token);
      setUser(authResult.authenticatedUser);

      return true;
    } catch (requestError) {
      const fallback = isRegister
        ? FALLBACK_ERRORS.register
        : FALLBACK_ERRORS.login;

      setError(getAuthError(requestError, fallback));

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setError("");
  }, []);

  return { user, error, loading, submit, logout, clearError };
}
