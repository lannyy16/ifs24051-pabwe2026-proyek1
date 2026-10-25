import PropTypes from "prop-types";
import { ArrowRight, Bookmark } from "lucide-react";
import HerbCard from "../components/HerbCard.jsx";
import { herbShape, idType } from "../utils/propTypes.js";
import { PAGES } from "../utils/routes.js";

export default function DashboardPage({
  user,
  herbs,
  savedIds,
  onSelectHerb,
  onToggleSave,
  onNavigate,
}) {
  const savedHerbs = herbs.filter((herb) => savedIds.includes(herb.id));

  return (
    <section className="section catalog">
      <p className="eyebrow">DASHBOARD</p>
      <h1>{user ? `Halo, ${user.name}` : "Ruang herbal saya"}</h1>
      <p>Herbal yang kamu simpan di perangkat ini.</p>

      {savedHerbs.length > 0 ? (
        <div className="cards">
          {savedHerbs.map((herb) => (
            <HerbCard
              key={herb.id}
              herb={herb}
              onClick={() => onSelectHerb(herb)}
              isSaved
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="notice">
          <Bookmark />
          <div>
            <b>Belum ada herbal tersimpan</b>
            <p>
              Buka katalog dan tekan “Simpan herbal” untuk menambah
              favorit.
            </p>
            <button
              type="button"
              className="textlink"
              onClick={() => onNavigate(PAGES.CATALOG)}
            >
              Buka katalog <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

DashboardPage.propTypes = {
  user: PropTypes.shape({ name: PropTypes.string }),
  herbs: PropTypes.arrayOf(herbShape).isRequired,
  savedIds: PropTypes.arrayOf(idType).isRequired,
  onSelectHerb: PropTypes.func.isRequired,
  onToggleSave: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
