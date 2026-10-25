import { BookOpen } from "lucide-react";

const ARTICLES = [
  {
    title: "Memahami penggunaan herbal secara bijak",
    body: "Kenali perbedaan penggunaan tradisional, bukti penelitian, dan keamanan sebelum menggunakan tanaman herbal.",
  },
  {
    title: "Herbal sebagai bagian dari budaya Nusantara",
    body: "Tanaman, tradisi, dan pengetahuan lokal yang diwariskan dari generasi ke generasi.",
  },
  {
    title: "Membaca informasi keamanan tanaman",
    body: "Perhatikan alergi, interaksi obat, dosis, serta kondisi khusus dan mintalah saran tenaga kesehatan bila diperlukan.",
  },
];

export default function ArticlesPage() {
  return (
    <section className="section catalog">
      <p className="eyebrow">PENGETAHUAN</p>
      <h1>Artikel herbal</h1>
      <p>
        Artikel pengantar untuk membantu memahami informasi herbal
        secara kritis.
      </p>

      {ARTICLES.map((article) => (
        <article className="articlebox" key={article.title}>
          <BookOpen />
          <div>
            <b>{article.title}</b>
            <p>{article.body}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
