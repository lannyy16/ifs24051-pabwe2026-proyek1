
import { useState } from "react";
import { Eye, EyeOff, Leaf, LogIn, UserPlus } from "lucide-react";

import PropTypes from "prop-types";
export default function AuthPage({ mode, onSubmit, error, onSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const isRegister = mode === "Daftar";

  return (
    <section className="section catalog auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <Leaf />
        </div>

        <p className="eyebrow">HERBANUSANTARA</p>

        <h1>
          {isRegister ? "Buat akun" : "Selamat datang kembali"}
        </h1>

        <p>
          {isRegister
            ? "Buat akun demo untuk mencoba pengalaman personal."
            : "Masuk untuk membuka ruang herbal kamu."}
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();

            const data = new FormData(event.currentTarget);

            onSubmit({
              name: String(data.get("name") || "").trim(),
              email: String(data.get("email") || "")
                .trim()
                .toLowerCase(),
              password: String(data.get("password") || ""),
              confirmation: String(data.get("confirmation") || ""),
            });
          }}
        >
          {isRegister && (
            <label htmlFor="name">
              Nama lengkap
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={60}
                placeholder="Nama kamu"
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
            />
          </label>

          <label htmlFor="password">
            Kata sandi
            <span className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
                required
                minLength={isRegister ? 8 : 1}
                placeholder={
                  isRegister
                    ? "Minimal 8 karakter"
                    : "Masukkan kata sandi"
                }
              />

              <button
                type="button"
                aria-label={
                  showPassword
                    ? "Sembunyikan kata sandi"
                    : "Tampilkan kata sandi"
                }
                onClick={() => setShowPassword((value) => !value)}
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
              />
            </label>
          )}

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            id="btn-submit"
            className="primary auth-submit"
            type="submit"
          >
            {isRegister ? (
              <UserPlus size={16} />
            ) : (
              <LogIn size={16} />
            )}
            {isRegister ? "Daftar" : "Masuk"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
          <button
            type="button"
            className="textlink"
            onClick={() => onSwitch(isRegister ? "Masuk" : "Daftar")}
          >
            {isRegister ? "Masuk" : "Daftar sekarang"}
          </button>
        </p>

        <p className="auth-disclaimer">
          Mode demo: akun hanya tersimpan di browser ini (kata sandi di-hash).
          Jangan gunakan kata sandi asli.
        </p>
      </div>
    </section>
  );
}

AuthPage.propTypes = { mode: PropTypes.string.isRequired, onSubmit: PropTypes.func.isRequired, error: PropTypes.string, onSwitch: PropTypes.func.isRequired };
