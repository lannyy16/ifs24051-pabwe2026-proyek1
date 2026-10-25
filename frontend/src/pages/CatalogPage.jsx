
import { useEffect, useMemo, useState } from "react";
import { getHerbs } from "../services/api";

export default function CatalogPage() {
  const [herbs, setHerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("Semua");

  useEffect(() => {
    let active = true;

    async function fetchHerbs() {
      try {
        setLoading(true);
        setError("");

        const data = await getHerbs();

        if (active) {
          setHerbs(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) {
          setError("Gagal mengambil data tanaman herbal.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchHerbs();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      herbs
        .map((herb) => herb.category)
        .filter(
          (category) =>
            typeof category === "string" &&
            category.trim() !== ""
        )
    );

    return ["Semua", ...uniqueCategories];
  }, [herbs]);

  const filteredHerbs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return herbs.filter((herb) => {
      const name = herb.name || "";
      const scientificName = herb.scientificName || "";
      const description = herb.description || "";
      const category = herb.category || "";

      const matchesSearch = [
        name,
        scientificName,
        description,
      ].some((value) =>
        value.toLowerCase().includes(keyword)
      );

      const matchesCategory =
        selectedCategory === "Semua" ||
        category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [herbs, search, selectedCategory]);

  if (loading) {
    return (
      <main>
        <h1>Katalog Tanaman Herbal</h1>
        <p role="status">Memuat data tanaman herbal...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Katalog Tanaman Herbal</h1>
        <p role="alert">{error}</p>
        <button
          type="button"
          onClick={() => globalThis.location.reload()}
        >
          Coba Lagi
        </button>
      </main>
    );
  }

  return (
    <main>
      <section aria-labelledby="catalog-title">
        <h1 id="catalog-title">Katalog Tanaman Herbal</h1>
        <p>
          Jelajahi tanaman herbal Nusantara, penggunaan
          tradisional, bukti ilmiah, dan informasi keamanannya.
        </p>
      </section>

      <section aria-label="Pencarian dan filter">
        <label htmlFor="herb-search">
          Cari tanaman herbal
        </label>
        <input
          id="herb-search"
          type="search"
          placeholder="Masukkan nama tanaman..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <label htmlFor="herb-category">Kategori</label>
        <select
          id="herb-category"
          value={selectedCategory}
          onChange={(event) =>
            setSelectedCategory(event.target.value)
          }
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </section>

      <section aria-label="Hasil katalog">
        <p>
          Menampilkan {filteredHerbs.length} tanaman herbal
        </p>

        {filteredHerbs.length === 0 ? (
          <p role="status">
            Tanaman herbal tidak ditemukan.
          </p>
        ) : (
          <div className="cards">
            {filteredHerbs.map((herb) => (
              <article key={herb.id}>
                <div
                  style={{
                    backgroundColor: herb.color || "#f5f5f5",
                    padding: "16px",
                    borderRadius: "12px",
                  }}
                >
                  <span aria-hidden="true">
                    {herb.emoji || "🌿"}
                  </span>

                  <h2>{herb.name || "Tanaman Herbal"}</h2>

                  <p>
                    <i>
                      {herb.scientificName ||
                        "Nama ilmiah belum tersedia"}
                    </i>
                  </p>

                  <p>
                    {herb.description ||
                      "Deskripsi belum tersedia."}
                  </p>

                  <p>
                    Kategori:{" "}
                    {herb.category || "Belum dikategorikan"}
                  </p>

                  <h3>Manfaat Tradisional</h3>
                  <p>
                    {herb.traditional ||
                      "Informasi manfaat tradisional belum tersedia."}
                  </p>

                  <h3>Bukti Ilmiah</h3>
                  <p>
                    {herb.evidence ||
                      "Informasi bukti ilmiah belum tersedia."}
                  </p>

                  <h3>Keamanan</h3>
                  <p>
                    {herb.safety ||
                      "Informasi keamanan belum tersedia."}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
