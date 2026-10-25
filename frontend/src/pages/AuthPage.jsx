import { useState } from "react";

import {
  Eye,
  EyeOff,
  Leaf,
  LogIn,
  UserPlus,
} from "lucide-react";

// Mengambil nilai FormData dan memastikan hasilnya string
function getFormValue(formData, name) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

// Mengambil seluruh data form
function getAuthFormData(formData) {
  return {
    name: getFormValue(formData, "name").trim(),

    email: getFormValue(formData, "email")
      .trim()
      .toLowerCase(),

    password: getFormValue(formData, "password"),

    confirmation: getFormValue(
      formData,
      "confirmation"
    ),
  };
}

// Menentukan teks tombol submit
function getSubmitLabel(isRegister, loading) {
  if (loading) {
    return isRegister
      ? "Memproses pendaftaran..."
      : "Memproses login...";
  }

  return isRegister ? "Daftar" : "Masuk";
}

export default function AuthPage({
  mode,
  onSubmit,
  error,
  onSwitch,
  loading = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === "Daftar";

  // Mengirim data form
  function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    const formData = new FormData(event.currentTarget);

    const form = getAuthFormData(formData);

    onSubmit(form);
  }

  // Menampilkan atau menyembunyikan password
  function handlePasswordVisibility() {
    setShowPassword((previousValue) => !previousValue);
  }

  // Berpindah mode login dan daftar
  function handleSwitch() {
    onSwitch(isRegister ? "Masuk" : "Daftar");
  }

  return (
    <section className="section catalog auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <Leaf />
        </div>

        <p className="eyebrow">
          HERBANUSANTARA
        </p>

        <h1>
          {isRegister
            ? "Buat akun"
            : "Selamat datang kembali"}
        </h1>

        <p>
          {isRegister
            ? "Buat akun untuk menikmati pengalaman herbal yang lebih personal."
            : "Masuk untuk membuka ruang herbal kamu."}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Nama lengkap */}
          {isRegister && (
            <label htmlFor="name">
              Nama lengkap

              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                placeholder="Nama kamu"
                disabled={loading}
              />
            </label>
          )}

          {/* Email */}
          <label htmlFor="username">
            Email

            <input
              id="username"
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              placeholder="nama@email.com"
              disabled={loading}
            />
          </label>

          {/* Password */}
          <label htmlFor="password">
            Kata sandi

            <span className="password-field">
              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                autoComplete={
                  isRegister
                    ? "new-password"
                    : "current-password"
                }
                required
                minLength={isRegister ? 8 : 1}
                placeholder={
                  isRegister
                    ? "Minimal 8 karakter"
                    : "Masukkan kata sandi"
                }
                disabled={loading}
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                onClick={handlePasswordVisibility}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>
            </span>
          </label>

          {/* Konfirmasi password */}
          {isRegister && (
            <label htmlFor="confirmation">
              Konfirmasi kata sandi

              <input
                id="confirmation"
                name="confirmation"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                placeholder="Ulangi kata sandi"
                disabled={loading}
              />
            </label>
          )}

          {/* Pesan error */}
          {error && (
            <p
              className="auth-error"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* Tombol submit */}
          <button
            id="btn-submit"
            className="primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              getSubmitLabel(isRegister, loading)
            ) : (
              <>
                {isRegister ? (
                  <UserPlus size={16} />
                ) : (
                  <LogIn size={16} />
                )}

                {getSubmitLabel(isRegister, loading)}
              </>
            )}
          </button>
        </form>

        {/* Berpindah halaman */}
        <p className="auth-switch">
          {isRegister
            ? "Sudah punya akun?"
            : "Belum punya akun?"}

          {" "}

          <button
            type="button"
            className="textlink"
            disabled={loading}
            onClick={handleSwitch}
          >
            {isRegister
              ? "Masuk"
              : "Daftar sekarang"}
          </button>
        </p>

        {/* Informasi keamanan */}
        <p className="auth-disclaimer">
          Akun kamu diproses melalui backend HerbaNusantara.
          Kata sandi disimpan dengan proses hashing
          pada server.
        </p>
      </div>
    </section>
  );
}