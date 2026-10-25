
import { useState } from "react";

import {
  Eye,
  EyeOff,
  Leaf,
  LogIn,
  UserPlus,
} from "lucide-react";

export default function AuthPage({
  mode,
  onSubmit,
  error,
  onSwitch,
  loading = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === "Daftar";

  function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    const data = new FormData(event.currentTarget);

    const form = {
      name: String(data.get("name") || "").trim(),

      email: String(data.get("email") || "")
        .trim()
        .toLowerCase(),

      password: String(data.get("password") || ""),

      confirmation: String(
        data.get("confirmation") || ""
      ),
    };

    onSubmit(form);
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
                onClick={() =>
                  setShowPassword((value) => !value)
                }
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

          {error && (
            <p
              className="auth-error"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            id="btn-submit"
            className="primary auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                {isRegister
                  ? "Memproses pendaftaran..."
                  : "Memproses login..."}
              </>
            ) : (
              <>
                {isRegister ? (
                  <UserPlus size={16} />
                ) : (
                  <LogIn size={16} />
                )}

                {isRegister ? "Daftar" : "Masuk"}
              </>
            )}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister
            ? "Sudah punya akun?"
            : "Belum punya akun?"}{" "}

          <button
            type="button"
            className="textlink"
            disabled={loading}
            onClick={() =>
              onSwitch(
                isRegister
                  ? "Masuk"
                  : "Daftar"
              )
            }
          >
            {isRegister
              ? "Masuk"
              : "Daftar sekarang"}
          </button>
        </p>

        <p className="auth-disclaimer">
          Akun kamu diproses melalui backend HerbaNusantara.
          Kata sandi disimpan dengan proses hashing
          pada server.
        </p>
      </div>
    </section>
  );
}
