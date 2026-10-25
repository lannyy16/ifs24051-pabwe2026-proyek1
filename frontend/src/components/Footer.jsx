import PropTypes from "prop-types";

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer">
      <p>
        © {new Date().getFullYear()} HerbaNusantara
      </p>
      <button
        type="button"
        className="textlink"
        onClick={() => onNavigate("Beranda")}
      >
        Kembali ke Beranda
      </button>
    </footer>
  );
}

Footer.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
