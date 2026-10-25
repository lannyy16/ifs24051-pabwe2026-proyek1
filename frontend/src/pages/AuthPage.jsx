import PropTypes from "prop-types";
import { Leaf, LogIn, UserPlus } from "lucide-react";
import PasswordField from "../components/PasswordField.jsx";
import {
  getAuthFormData,
  getSubmitLabel,
} from "../utils/authForm.js";
import { PAGES } from "../utils/routes.js";

export default function AuthPage({
  mode,
  onSubmit,
  error,
  onSwitch,
  loading = false,
}) {
  const isRegister = mode === PAGES.REGISTER;

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

  // Berpindah mode login dan daftar
  function handleSwitch() {
    onSwitch(isRegister ? PAGES.LOGIN : PAGES.REGISTER);
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
          <PasswordField isRegister={isRegister} disabled={loading} />

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

AuthPage.propTypes = {
  mode: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
  onSwitch: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
