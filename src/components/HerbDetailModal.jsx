
import { ArrowLeft, Bookmark } from "lucide-react";
import { herbDescription, herbEmoji, herbNameLatin } from "./HerbCard.jsx";

export default function HerbDetailModal({ herb, onClose, saved, onToggleSave }) {
  if (!herb) return null;

  const benefits = Array.isArray(herb.benefits) ? herb.benefits : [];

  return (
    <section className="detail" aria-labelledby="herb-detail-title">
      <button className="back" onClick={onClose}>
        <ArrowLeft size={15} /> Kembali ke katalog
      </button>

      <div className="detailgrid">
        <div
          className="plantpic"
          style={{ background: herb.color || "#e9f5e8" }}
        >
          <span>{herbEmoji(herb)}</span>
          <small>{herb.category || herb.tag || "Herbal"}</small>
        </div>

        <div>
          <p className="eyebrow">ENSIKLOPEDIA HERBAL</p>
          <h1 id="herb-detail-title">{herb.name}</h1>
          <i>{herbNameLatin(herb)}</i>
          <p>{herbDescription(herb)}</p>

          <button className="save" onClick={() => onToggleSave(herb.id)}>
            <Bookmark size={16} />
            {saved ? "Tersimpan" : "Simpan herbal"}
          </button>

          <div className="info">
            <h3>Manfaat atau penggunaan tradisional</h3>

            {herb.traditional && <p>{herb.traditional}</p>}

            {benefits.length > 0 ? (
              <ul>
                {benefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            ) : (
              !herb.traditional && (
                <p>Informasi manfaat belum tersedia.</p>
              )
            )}

            <h3>Informasi ilmiah</h3>
            <p>
              {herb.evidence ||
                "Informasi bukti ilmiah belum tersedia. Penggunaan tradisional tidak selalu berarti manfaat klinis telah terbukti."}
            </p>

            <h3>Keamanan</h3>
            <p>
              {herb.safety ||
                "Perhatikan kemungkinan alergi dan interaksi dengan obat. Konsultasikan dengan tenaga kesehatan sebelum penggunaan untuk tujuan pengobatan."}
            </p>
          </div>
        </div>
      </div>

      <p className="disclaimer">
        Informasi ini untuk edukasi, bukan diagnosis atau pengganti saran tenaga kesehatan.
      </p>
    </section>
  );
}
