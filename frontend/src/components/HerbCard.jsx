import PropTypes from "prop-types";
import { ArrowRight, ChevronRight } from "lucide-react";
import { herbShape } from "../utils/propTypes.js";
import {
  herbCategoryLabel,
  herbDescription,
  herbEmoji,
  herbNameLatin,
} from "../utils/herbFormatters.js";

export default function HerbCard({
  herb,
  onClick,
  isSaved = false,
  onToggleSave,
}) {
  return (
    <article className="herbcard-wrap">
      <button
        className="herbcard"
        type="button"
        onClick={onClick}
        aria-label={`Lihat profil ${herb.name}`}
      >
        <div
          className="cardpic"
          style={{
            background: herb.color || "#e9f5e8",
          }}
        >
          <span aria-hidden="true">{herbEmoji(herb)}</span>
          <small>{herbCategoryLabel(herb)}</small>
        </div>

        <div className="cardbody">
          <div className="cardtitle">
            <h3>{herb.name}</h3>
            <ArrowRight size={17} aria-hidden="true" />
          </div>

          <i>{herbNameLatin(herb)}</i>

          <p>{herbDescription(herb)}</p>

          <span className="read">
            Lihat profil{" "}
            <ChevronRight size={14} aria-hidden="true" />
          </span>
        </div>
      </button>

      {onToggleSave && (
        <button
          className="card-save"
          type="button"
          onClick={() => onToggleSave(herb.id)}
          aria-pressed={isSaved}
        >
          {isSaved ? "♥ Tersimpan" : "♡ Simpan"}
        </button>
      )}
    </article>
  );
}

HerbCard.propTypes = {
  herb: herbShape.isRequired,
  onClick: PropTypes.func.isRequired,
  isSaved: PropTypes.bool,
  onToggleSave: PropTypes.func,
};
