import Brand from "./Brand.jsx";

export default function Footer({ onNavigate }) {
  return (
    <footer>
      <div className="wrap foot">
        <Brand onClick={() => onNavigate("Beranda")} />
        <p>Pengetahuan herbal untuk edukasi yang lebih bijak.</p>
        <small>© {new Date().getFullYear()} HerbaNusantara · Informasi bukan pengganti konsultasi medis.</small>
      </div>
    </footer>
  );
}
