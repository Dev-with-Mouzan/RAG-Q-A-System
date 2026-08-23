const ITEMS = [
  "Retrieval Augmented Generation",
  "FAISS Vector Search",
  "Semantic Understanding",
  "Multi-Source Grounding",
  "Citation-Backed Answers",
  "PDF Intelligence",
];

export default function TechStrip() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="tech-strip" aria-hidden="true">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span key={i} className="marquee-item">{item}</span>
        ))}
      </div>
    </div>
  );
}
