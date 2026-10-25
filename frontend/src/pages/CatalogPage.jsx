import PropTypes from "prop-types";
import { Search } from "lucide-react";
import HerbCard from "../components/HerbCard.jsx";
import { herbShape, idType } from "../utils/propTypes.js";

function categoryOf(herb) {
  return herb.category || herb.tag;
}

export default function CatalogPage({
  herbs,
  search,
  onSearch,
  category,
  onCategory,
  onSelectHerb,
  savedIds,
  onToggleSave,
  loading = false,
  error = "",
  onRetry,
}) {
  const categories = [
    "Semua",
    ...new Set(herbs.map(categoryOf).filter(Boolean)),
  ];

  const visibleHerbs = herbs.filter(
    (herb) => category === "Semua" || categoryOf(herb) === category,
  );

  const showResults = !loading && !error;

  return (
    <section className="section catalog">
      <p className="eyebrow">KATALOG</p>
      <h1>Jelajahi tanaman herbal</h1>
      <p>
        Temukan profil tanaman, penggunaan tradisional, bukti, dan
        keamanan.
      </p>

      <label className="search">
        <Search aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Cari nama, kategori, atau nama ilmiah..."
          aria-label="Cari tanaman herbal"
        />
      </label>

      <fieldset className="filterrow" aria-label="Filter kategori">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`filter-chip ${category === item ? "active" : ""}`}
            aria-pressed={category === item}
            onClick={() => onCategory(item)}
          >
            {item}
          </button>
        ))}
      </fieldset>

      {loading && <output>Memuat data tanaman...</output>}

      {error && (
        <div className="notice" role="alert">
          <div>
            <b>Data belum dapat dimuat</b>
            <p>{error}</p>
            <button type="button" className="textlink" onClick={onRetry}>
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {showResults && (
        <>
          <div className="cards">
            {visibleHerbs.map((herb) => (
              <HerbCard
                key={herb.id}
                herb={herb}
                onClick={() => onSelectHerb(herb)}
                isSaved={savedIds.includes(herb.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>

          {visibleHerbs.length === 0 && (
            <p>Tanaman tidak ditemukan untuk pencarian atau kategori ini.</p>
          )}
        </>
      )}
    </section>
  );
}

CatalogPage.propTypes = {
  herbs: PropTypes.arrayOf(herbShape).isRequired,
  search: PropTypes.string.isRequired,
  onSearch: PropTypes.func.isRequired,
  category: PropTypes.string.isRequired,
  onCategory: PropTypes.func.isRequired,
  onSelectHerb: PropTypes.func.isRequired,
  savedIds: PropTypes.arrayOf(idType).isRequired,
  onToggleSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onRetry: PropTypes.func.isRequired,
};
