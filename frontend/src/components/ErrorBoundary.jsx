import PropTypes from "prop-types";
import { Component } from "react";

/**
 * Menangkap error render pada komponen anak agar seluruh aplikasi
 * tidak menjadi layar kosong.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Kesalahan tak terduga pada aplikasi:", error, info);
  }

  handleReset() {
    this.setState({ hasError: false });
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <section className="section catalog" role="alert">
        <p className="eyebrow">TERJADI KESALAHAN</p>
        <h1>Halaman tidak dapat ditampilkan</h1>
        <p>
          Maaf, terjadi kesalahan tak terduga. Silakan coba lagi atau muat
          ulang halaman.
        </p>
        <button type="button" className="primary" onClick={this.handleReset}>
          Coba lagi
        </button>
      </section>
    );
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
};
