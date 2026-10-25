import { ArrowRight, ShieldCheck } from "lucide-react";

import PropTypes from "prop-types";
const topics = [{ name: "Mual ringan", emoji: "🌿", keyword: "jahe" }, { name: "Kualitas tidur", emoji: "🌼", keyword: "chamomile" }, { name: "Pencernaan", emoji: "🍃", keyword: "" }, { name: "Relaksasi", emoji: "☘️", keyword: "chamomile" }];
export default function FinderPage({ onChooseTopic }) {
  return <section className="section catalog"><p className="eyebrow">HERBAL FINDER</p><h1>Informasi berdasarkan topik</h1><p>Pilih topik untuk membaca informasi edukatif. Hasil bukan diagnosis dan tidak menentukan pengobatan.</p><div className="findergrid">{topics.map((topic) => <button className="topic" key={topic.name} onClick={() => onChooseTopic(topic.keyword)}><span>{topic.emoji}</span><b>{topic.name}</b><small>Lihat informasi herbal terkait <ArrowRight size={13}/></small></button>)}</div><div className="notice"><ShieldCheck/><div><b>Perhatian</b><p>Jika keluhan berat, berlangsung lama, atau memburuk, hubungi tenaga kesehatan. Jangan menghentikan obat yang diresepkan.</p></div></div></section>;
}

FinderPage.propTypes = { onChooseTopic: PropTypes.func.isRequired };
