import PropTypes from "prop-types";
import { ChevronRight, Globe, LogIn, LogOut, UserPlus } from "lucide-react";
import Brand from "./Brand.jsx";
import { NAV_ITEMS } from "../data/navigation.js";

export default function Navbar({ page, onNavigate, user, onLogout }) {
  return (
    <header>
      <div className="nav wrap">
        <Brand onClick={() => onNavigate("Beranda")} />

        <nav aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              type="button"
              className={page === item ? "active" : ""}
              onClick={() => onNavigate(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="nav-auth">
          {user ? (
            <button type="button" className="lang" onClick={onLogout}>
              <LogOut size={15} /> Keluar
            </button>
          ) : (
            <>
              <button
                type="button"
                className="lang"
                onClick={() => onNavigate("Masuk")}
              >
                <LogIn size={15} /> Masuk
              </button>
              <button
                type="button"
                className="lang"
                onClick={() => onNavigate("Daftar")}
              >
                <UserPlus size={15} /> Daftar
              </button>
            </>
          )}

          <span className="lang">
            <Globe size={15} /> ID <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </header>
  );
}

Navbar.propTypes = {
  page: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
  user: PropTypes.shape({ name: PropTypes.string }),
  onLogout: PropTypes.func.isRequired,
};
