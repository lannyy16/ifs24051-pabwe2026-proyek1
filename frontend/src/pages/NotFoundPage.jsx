import PropTypes from "prop-types";
import { ArrowRight } from "lucide-react";
import { PAGES } from "../utils/routes.js";

export default function NotFoundPage({ onNavigate }) {
  return (
    <section className="section catalog">
      <p className="eyebrow">404</p>
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.</p>

      <button
        type="button"
        className="primary"
        onClick={() => onNavigate(PAGES.HOME)}
      >
        Kembali ke Beranda
        <ArrowRight size={16} />
      </button>
    </section>
  );
}

NotFoundPage.propTypes = {
  onNavigate: PropTypes.func.isRequired,
};
