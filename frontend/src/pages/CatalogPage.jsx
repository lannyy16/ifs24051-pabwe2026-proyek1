import { Search } from "lucide-react";
import HerbCard from "../components/HerbCard.jsx";

export default function CatalogPage({ herbs, search, onSearch, category, onCategory, onSelectHerb, savedIds, onToggleSave, loading, error, onRetry }) {
  const categories = ["Semua", ...new Set(herbs.map((herb) => herb.category || herb.tag).filter(Boolean))];
  const visibleHerbs = herbs.filter((herb) => category === "Semua" || (herb.category || herb.tag) === category);
  return <section className="section catalog"><p className="eyebrow">KATALOG</p><h1>Jelajahi tanaman herbal</h1><p>Temukan profil tanaman, penggunaan tradisional, bukti, dan keamanan.</p><label className="search"><Search/><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Cari nama, kategori, atau nama ilmiah..." aria-label="Cari tanaman herbal"/></label>
    <div className="filterrow" aria-label="Filter kategori">{categories.map((item) => <button key={item} className={`filter-chip ${category === item ? "active" : ""}`} onClick={() => onCategory(item)}>{item}</button>)}</div>
    {loading && <p role="status">Memuat data tanaman...</p>}
    {error && <div className="notice" role="alert"><div><b>Data belum dapat dimuat</b><p>{error}</p><button className="textlink" onClick={onRetry}>Coba lagi</button></div></div>}
    {!loading && !error && <><div className="cards">{visibleHerbs.map((herb) => <HerbCard key={herb.id} herb={herb} onClick={() => onSelectHerb(herb)} isSaved={savedIds.includes(herb.id)} onToggleSave={onToggleSave}/>)}</div>{visibleHerbs.length === 0 && <p>Tanaman tidak ditemukan untuk pencarian atau kategori ini.</p>}</>}
  </section>;
}
