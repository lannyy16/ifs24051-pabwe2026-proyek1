import { BookOpen } from "lucide-react";
import { ARTICLES } from "../data/articles.js";

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
