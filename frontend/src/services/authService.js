import { apiRequest } from "./api.js";

const MAX_EMAIL_LENGTH = 254;

function getStringValue(value) {
  return typeof value === "string" ? value : "";
}

/**
 * Validasi email sederhana tanpa regex
 * (menghindari backtracking pada input panjang).
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (email.length > MAX_EMAIL_LENGTH || /\s/.test(email)) {
    return false;
  }

  const atIndex = email.indexOf("@");

  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) {
    return false;
  }

  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.lastIndexOf(".");

  return dotIndex > 0 && dotIndex < domain.length - 1;
}

function validateRegisterFields(form, email, password) {
  const name = getStringValue(form.name).trim();
  const confirmation = getStringValue(form.confirmation);

  if (name.length < 2) {
    return { error: "Nama minimal 2 karakter." };
  }

  if (password.length < 8) {
    return { error: "Kata sandi harus minimal 8 karakter." };
  }

  if (password !== confirmation) {
    return { error: "Konfirmasi kata sandi tidak cocok." };
  }

  return { name, email, password };
}

/**
 * Memvalidasi form login atau registrasi.
 *
 * @returns {{error: string} | {email: string, password: string, name?: string}}
 */
export function validateAuthForm(form, isRegister) {
  const email = getStringValue(form.email).trim().toLowerCase();
  const password = getStringValue(form.password);

  if (!isValidEmail(email)) {
    return { error: "Masukkan alamat email yang valid." };
  }

  if (!password) {
    return { error: "Kata sandi wajib diisi." };
  }

  if (!isRegister) {
    return { email, password };
  }

  return validateRegisterFields(form, email, password);
}

export function getAuthError(requestError, fallback) {
  return requestError instanceof Error
    ? requestError.message
    : fallback;
}

export function getAuthResult(result) {
  const authenticatedUser = result.data?.user;
  const token = result.data?.token;

  if (!authenticatedUser || !token) {
    throw new Error(
      "Autentikasi berhasil, tetapi data pengguna atau token tidak lengkap.",
    );
  }

  return { authenticatedUser, token };
}

function postAuth(endpoint, form) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(form),
  });
}

export async function registerUser(form) {
  return getAuthResult(await postAuth("/auth/register", form));
}

export async function loginUser(form) {
  return getAuthResult(await postAuth("/auth/login", form));
}

export async function fetchCurrentUser() {
  const result = await apiRequest("/auth/me");
  const authenticatedUser = result.data?.user;

  if (!authenticatedUser) {
    throw new Error("Data pengguna tidak ditemukan.");
  }

  return authenticatedUser;
}
