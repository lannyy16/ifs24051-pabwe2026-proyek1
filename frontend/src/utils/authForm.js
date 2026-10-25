// Mengambil nilai FormData dan memastikan hasilnya string
function getFormValue(formData, name) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

/**
 * Mengubah FormData halaman login/registrasi menjadi objek form.
 *
 * @param {FormData} formData
 * @returns {{name: string, email: string, password: string, confirmation: string}}
 */
export function getAuthFormData(formData) {
  return {
    name: getFormValue(formData, "name").trim(),
    email: getFormValue(formData, "email").trim().toLowerCase(),
    password: getFormValue(formData, "password"),
    confirmation: getFormValue(formData, "confirmation"),
  };
}

/**
 * Menentukan teks tombol submit sesuai mode dan status loading.
 *
 * @param {boolean} isRegister
 * @param {boolean} loading
 * @returns {string}
 */
export function getSubmitLabel(isRegister, loading) {
  if (loading) {
    return isRegister
      ? "Memproses pendaftaran..."
      : "Memproses login...";
  }

  return isRegister ? "Daftar" : "Masuk";
}
