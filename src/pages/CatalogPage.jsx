
import { useEffect, useState } from "react";
import { getHerbs } from "../services/api";

function CatalogPage() {
  const [herbs, setHerbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  useEffect(() => {
    async function fetchHerbs() {
      try {
        setLoading(true);
        setError("");

        const data = await getHerbs();

        setHerbs(data);
      } catch (error) {
        console.error("Gagal mengambil herbal:", error);
        setError("Gagal mengambil data tanaman herbal.");
      } finally {
        setLoading(false);
      }
    }

    fetchHerbs();
  }, []);

  const categories = [
    "Semua",
    ...new Set(herbs.map((herb) => herb.category)),
  ];

  const filteredHerbs = herbs.filter((herb) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      (herb.name || "").toLowerCase().includes(keyword) ||
      (herb.scientificName || "").toLowerCase().includes(keyword) ||
      (herb.description || "").toLowerCase().includes(keyword);

    const matchesCategory =
      selectedCategory === "Semua" ||
      herb.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <main>
        <h1>Katalog Tanaman Herbal</h1>
        <p>Memuat data tanaman herbal...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Katalog Tanaman Herbal</h1>
        <p>{error}</p>

        <button onClick={() => globalThis.location.reload()}>
          Coba Lagi
        </button>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h1>Katalog Tanaman Herbal</h1>

        <p>
          Jelajahi berbagai tanaman herbal Nusantara
          beserta informasi dan manfaat tradisionalnya.
        </p>
      </section>

      <section>
        <input
          type="text"
          placeholder="Cari nama tanaman herbal..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
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

      <section>
        <p>
          Menampilkan {filteredHerbs.length} tanaman herbal
        </p>

        {filteredHerbs.length === 0 ? (
          <p>Tanaman herbal tidak ditemukan.</p>
        ) : (
          <div>
            {filteredHerbs.map((herb) => (
              <article key={herb.id}>
                <div
                  style={{
                    backgroundColor: herb.color || "#f5f5f5",
                    padding: "16px",
                    borderRadius: "12px",
                  }}
                >
                  <span>{herb.emoji}</span>

                  <h2>{herb.name}</h2>

                  <p>
                    <i>{herb.scientificName || "Nama ilmiah belum tersedia"}</i>
                  </p>

                  <p>{herb.description || "Deskripsi belum tersedia."}</p>

                  <p>Kategori: {herb.category || "Belum dikategorikan"}</p>

                  <h3>Manfaat Tradisional</h3>
                  <p>{herb.traditional || "Informasi belum tersedia."}</p>

                  <h3>Bukti Ilmiah</h3>
                  <p>{herb.evidence || "Informasi belum tersedia."}</p>

                  <h3>Keamanan</h3>
                  <p>{herb.safety || "Informasi belum tersedia."}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default CatalogPage;
