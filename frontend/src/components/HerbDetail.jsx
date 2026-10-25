import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { ArrowLeft, Bookmark } from "lucide-react";
import { herbShape } from "../utils/propTypes.js";
import useEscapeKey from "../hooks/useEscapeKey.js";
import {
  herbCategoryLabel,
  herbDescription,
  herbEmoji,
  herbNameLatin,
} from "../utils/herbFormatters.js";

/**
 * Tampilan detail herbal. Judulnya menerima fokus saat dibuka (untuk
 * pembaca layar) dan tombol Escape menutupnya.
 */
export default function HerbDetail({
  herb,
  onClose,
  saved,
  onToggleSave,
}) {
  const titleRef = useRef(null);

  useEscapeKey(onClose);

  useEffect(() => {
    titleRef.current?.focus();
  }, [herb?.id]);

  if (!herb) {
    return null;
  }

  const benefits = Array.isArray(herb.benefits)
    ? herb.benefits
    : [];

  const traditional = herb.traditional;
  const evidence =
    herb.evidence ||
    "Informasi bukti ilmiah belum tersedia. Penggunaan tradisional tidak selalu berarti manfaat klinis telah terbukti.";

  const safety =
    herb.safety ||
    "Perhatikan kemungkinan alergi dan interaksi dengan obat. Konsultasikan dengan tenaga kesehatan sebelum penggunaan untuk tujuan pengobatan.";

  return (
    <article
      className="detail"
      aria-labelledby="herb-detail-title"
    >
      <button
        className="back"
        type="button"
        onClick={onClose}
      >
        <ArrowLeft size={15} />
        Kembali ke katalog
      </button>

      <div className="detailgrid">
        <div
          className="plantpic"
          style={{
            background: herb.color || "#e9f5e8",
          }}
        >
          <span>{herbEmoji(herb)}</span>

          <small>
            {herbCategoryLabel(herb)}
          </small>
        </div>

        <div>
          <p className="eyebrow">
            ENSIKLOPEDIA HERBAL
          </p>

          <h1
            id="herb-detail-title"
            ref={titleRef}
            tabIndex={-1}
          >
            {herb.name}
          </h1>

          <i>{herbNameLatin(herb)}</i>

          <p>{herbDescription(herb)}</p>

          <button
            className="save"
            type="button"
            onClick={() => onToggleSave(herb.id)}
            aria-pressed={Boolean(saved)}
          >
            <Bookmark size={16} />
            {saved ? "Tersimpan" : "Simpan herbal"}
          </button>

          <div className="info">
            <h3>
              Manfaat atau penggunaan tradisional
            </h3>

            {traditional && (
              <p>{traditional}</p>
            )}

            {benefits.length > 0 && (
              <ul>
                {benefits.map((benefit) => (
                  <li key={benefit}>
                    {benefit}
                  </li>
                ))}
              </ul>
            )}

            {benefits.length === 0 && !traditional && (
              <p>Informasi manfaat belum tersedia.</p>
            )}

            <h3>Informasi ilmiah</h3>

            <p>{evidence}</p>

            <h3>Keamanan</h3>

            <p>{safety}</p>
          </div>
        </div>
      </div>

      <p className="disclaimer">
        Informasi ini untuk edukasi, bukan diagnosis
        atau pengganti saran tenaga kesehatan.
      </p>
    </article>
  );
}

HerbDetail.propTypes = {
  herb: herbShape,
  onClose: PropTypes.func.isRequired,
  saved: PropTypes.bool,
  onToggleSave: PropTypes.func.isRequired,
};
