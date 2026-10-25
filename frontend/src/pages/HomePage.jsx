import PropTypes from "prop-types";
import { ArrowRight, Leaf, ShieldCheck } from "lucide-react";
import HerbCard from "../components/HerbCard.jsx";
import { PLANT_CATEGORIES } from "../data/plantCategories.js";
import { herbShape } from "../utils/propTypes.js";
import { PAGES } from "../utils/routes.js";

export default function HomePage({ herbs, onNavigate, onSelectHerb }) {
  return (
    <>
      <section className="hero">
        <div className="heroText">
          <span className="pill">
            <Leaf size={15} />
            ENSIKLOPEDIA HERBAL INDONESIA
          </span>

          <h1>
            Kenali alam,
            <br />
            <em>rawat keseimbangan.</em>
          </h1>

          <p>
            Jelajahi tanaman herbal Nusantara, kenali penggunaan
            tradisional, bukti ilmiah, dan informasi keamanannya.
          </p>

          <div className="actions">
            <button
              type="button"
              className="primary"
              onClick={() => onNavigate(PAGES.CATALOG)}
            >
              Jelajahi herbal
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => onNavigate(PAGES.FINDER)}
            >
              Cari berdasarkan topik
            </button>
          </div>

          <div className="stats">
            <span>
              <b>{String(herbs.length).padStart(2, "0")}</b>
              <small>Herbal pilihan</small>
            </span>

            <span>
              <b>06</b>
              <small>Kategori tanaman</small>
            </span>

            <span>
              <b>01</b>
              <small>Tujuan: edukasi</small>
            </span>
          </div>
        </div>

        <div className="heroArt">
          <div className="sun" />
          <div className="leafart">🌿</div>

          <div className="artnote">
            <span>✦</span>
            <b>Herbal Nusantara</b>
            <small>Tradisi • Pengetahuan • Alam</small>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sectionhead">
          <div>
            <p className="eyebrow">JELAJAHI</p>
            <h2>Temukan herbal pilihan</h2>
            <p>
              Kenali tanaman dari berbagai kategori dan manfaat
              tradisionalnya.
            </p>
          </div>

          <button
            type="button"
            className="textlink"
            onClick={() => onNavigate(PAGES.CATALOG)}
          >
            Lihat semua
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="cards">
          {herbs.slice(0, 3).map((herb) => (
            <HerbCard
              key={herb.id}
              herb={herb}
              onClick={() => onSelectHerb(herb)}
            />
          ))}
        </div>
      </section>

      <section className="finderbanner">
        <div>
          <p className="eyebrow">HERBAL FINDER</p>
          <h2>Mulai dari apa yang ingin kamu ketahui.</h2>
          <p>
            Temukan informasi herbal berdasarkan topik secara
            edukatif, bukan untuk diagnosis.
          </p>
        </div>

        <button
          type="button"
          className="primary"
          onClick={() => onNavigate(PAGES.FINDER)}
        >
          Mulai pencarian
          <ArrowRight size={16} />
        </button>
      </section>

      <section className="section categories">
        <div className="sectionhead">
          <div>
            <p className="eyebrow">KATEGORI</p>
            <h2>Beragam bentuk, satu kekayaan</h2>
          </div>
        </div>

        <div className="categorygrid">
          {PLANT_CATEGORIES.map(({ emoji, name, examples }) => (
            <button
              type="button"
              onClick={() => onNavigate(PAGES.CATALOG, name)}
              className="cat"
              key={name}
            >
              <span>{emoji}</span>
              <b>{name}</b>
              <small>{examples}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="notice">
        <ShieldCheck />

        <div>
          <b>Gunakan informasi dengan bijak</b>

          <p>
            Informasi herbal tidak menggantikan diagnosis atau terapi
            dari tenaga kesehatan. Jika keluhan berat atau menetap,
            cari bantuan medis.
          </p>
        </div>
      </section>
    </>
  );
}

HomePage.propTypes = {
  herbs: PropTypes.arrayOf(herbShape).isRequired,
  onNavigate: PropTypes.func.isRequired,
  onSelectHerb: PropTypes.func.isRequired,
};
