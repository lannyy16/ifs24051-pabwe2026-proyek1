import { ArrowRight, Bookmark } from "lucide-react";
import HerbCard from "../components/HerbCard.jsx";
export default function DashboardPage({ user, herbs, savedIds, onSelectHerb, onToggleSave, onNavigate }) {
  const savedHerbs = herbs.filter((herb) => savedIds.includes(herb.id));
  return <section className="section catalog"><p className="eyebrow">DASHBOARD</p><h1>{user ? `Halo, ${user.name}` : "Ruang herbal saya"}</h1><p>Herbal yang kamu simpan di perangkat ini.</p>{savedHerbs.length ? <div className="cards">{savedHerbs.map((herb) => <HerbCard key={herb.id} herb={herb} onClick={() => onSelectHerb(herb)} isSaved onToggleSave={onToggleSave}/>)}</div> : <div className="notice"><Bookmark/><div><b>Belum ada herbal tersimpan</b><p>Buka katalog dan tekan “Simpan herbal” untuk menambah favorit.</p><button className="textlink" onClick={() => onNavigate("Katalog Herbal")}>Buka katalog <ArrowRight size={15}/></button></div></div>}</section>;
}
