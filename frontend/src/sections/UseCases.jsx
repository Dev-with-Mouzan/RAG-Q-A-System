import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Eyebrow from "../components/Eyebrow";
import ArrowButton from "../components/ArrowButton";
import { IconPdf, IconSearch, IconHybrid } from "../lib/icons";

const ease = [0.165, 0.84, 0.44, 1];

const TABS = [
  {
    id: "pdf",
    label: "Chat with PDFs",
    icon: <IconPdf size={15} />,
    view: "pdf",
    bullets: [
      "Upload papers, reports, theses or manuals",
      "Ask questions in plain language",
      "Answers cite the exact retrieved passages",
      "History saved per conversation",
    ],
    mock: (
      <>
        <div className="uc-line q">Summarize the key findings of section 4</div>
        <div className="uc-line a">
          Section 4 reports a <b>12.3% accuracy gain</b> over the dense-retrieval baseline,
          with the largest improvements on multi-hop questions…
        </div>
        <div className="uc-cites"><span>p. 14 · §4.2</span><span>Table 3</span></div>
      </>
    ),
  },
  {
    id: "search",
    label: "Academic Search",
    icon: <IconSearch size={15} />,
    view: "hybrid",
    bullets: [
      "Query arXiv, Semantic Scholar & PubMed",
      "Semantic ranking beyond keyword match",
      "Abstracts and direct source links",
      "Filter by individual database",
    ],
    mock: (
      <>
        <div className="uc-line q">transformer efficiency long context</div>
        <div className="uc-hit"><b>FlashAttention-3</b><span>arXiv · 2024 · cited 812</span></div>
        <div className="uc-hit"><b>LongLoRA</b><span>Semantic Scholar · 2023</span></div>
      </>
    ),
  },
  {
    id: "hybrid",
    label: "Hybrid Research",
    icon: <IconHybrid size={15} />,
    view: "hybrid",
    bullets: [
      "Merge your library with public corpora",
      "One answer spanning both worlds",
      "Ideal for literature reviews",
      "Grounded in everything at once",
    ],
    mock: (
      <>
        <div className="uc-line q">How does my draft compare to SOTA?</div>
        <div className="uc-line a">
          Your §2 pipeline matches <b>FlashAttention-3</b>'s tiling strategy; the
          remaining gap is kernel fusion for the MLP block…
        </div>
        <div className="uc-cites"><span>Your PDF · draft_v3.pdf</span><span>arXiv · 2407.08608</span></div>
      </>
    ),
  },
];

export default function UseCases({ navigate }) {
  const [active, setActive] = useState("pdf");
  const tab = TABS.find((t) => t.id === active);

  return (
    <section className="section usecases-sec">
      <div className="container">
        <div className="sec-head">
          <Eyebrow>Use Cases</Eyebrow>
          <h2 className="sec-title">Built for how you actually research.</h2>
        </div>

        <div className="usecases-panel">
          <div className="usecase-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={active === t.id}
                className={`usecase-tab${active === t.id ? " active" : ""}`}
                onClick={() => setActive(t.id)}
              >
                {active === t.id && (
                  <motion.span layoutId="uc-pill" className="usecase-pill" transition={{ duration: 0.35, ease }} />
                )}
                <span className="usecase-tab-label">{t.icon}{t.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              className="usecase-body"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35, ease }}
            >
              <ul className="usecase-list">
                {tab.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

              <div className={`usecase-mock theme-${tab.id}`}>
                <div className="uc-mock-head mono">{tab.label.toLowerCase().replace(/\s/g, "_")}</div>
                {tab.mock}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="usecase-footer">
            <button className="btn-flat" onClick={() => navigate(tab.view)}>
              Try it now <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
