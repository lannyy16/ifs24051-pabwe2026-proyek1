import PropTypes from "prop-types";

export default function Brand({ onClick }) {
  return (
    <button
      className="brand"
      type="button"
      onClick={onClick}
    >
      <span className="logo" aria-hidden="true">
        🌿
      </span>

      <span>
        Herba<span>Nusantara</span>
        <small>KENALI KEKAYAAN HERBAL</small>
      </span>
    </button>
  );
}

Brand.propTypes = {
  onClick: PropTypes.func,
};
