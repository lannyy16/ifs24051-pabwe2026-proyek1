
import { Leaf } from "lucide-react";

export default function Brand({ onClick }) {
  return (
    <button
      className="brand"
      type="button"
      onClick={onClick}
    >
      <span className="logo" aria-hidden="true">
        <Leaf />
      </span>

      <span>
        Herba<span>Nusantara</span>
        <small>KENALI KEKAYAAN HERBAL</small>
      </span>
    </button>
  );
}
