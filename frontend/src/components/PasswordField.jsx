import PropTypes from "prop-types";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  isRegister = false,
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label htmlFor="password">
      Kata sandi

      <span className="password-field">
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          minLength={isRegister ? 8 : 1}
          placeholder={
            isRegister ? "Minimal 8 karakter" : "Masukkan kata sandi"
          }
          disabled={disabled}
        />

        <button
          type="button"
          aria-label={
            showPassword
              ? "Sembunyikan kata sandi"
              : "Tampilkan kata sandi"
          }
          onClick={() => setShowPassword((previous) => !previous)}
          disabled={disabled}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}

PasswordField.propTypes = {
  isRegister: PropTypes.bool,
  disabled: PropTypes.bool,
};
