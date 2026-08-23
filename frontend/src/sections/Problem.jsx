import Eyebrow from "../components/Eyebrow";
import Reveal from "../components/Reveal";
import { IconScatter, IconAlertChat, IconNote } from "../lib/icons";

const CARDS = [
  {
    icon: <IconScatter size={26} />,
    title: "Knowledge scattered everywhere",
    body: "Papers live across arXiv, Semantic Scholar and PubMed. Finding the one that answers your question means juggling search syntaxes, filters and dead ends.",
  },
  {
    icon: <IconAlertChat size={26} />,
    title: "AI that hallucinates",
    body: "Generic chatbots answer confidently without sources. In research, an uncited answer is worse than no answer — you can't verify what you can't trace.",
  },
  {
    icon: <IconNote size={26} />,
    title: "Documents too dense to digest",
    body: "A single PDF can run hundreds of pages of methods and results. Reading five papers end-to-end before knowing if they're relevant wastes entire days.",
  },
];

export default function Problem() {
  return (
    <section className="section problem-sec">
      <div className="container">
        <div className="sec-head">
          <Eyebrow>The Problem</Eyebrow>
          <h2 className="sec-title">
            Doing deep research at scale <span className="accent">is hard.</span>
          </h2>
        </div>

        <div className="sticky-stack">
          {CARDS.map((card, i) => (
            <article key={card.title} className="problem-card" style={{ top: `calc(6.5rem + ${i * 2.4}rem)` }}>
              <span className="problem-num mono">{String(i + 1).padStart(2, "0")}</span>
              <div className="problem-icon">{card.icon}</div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </article>
          ))}
        </div>

        <Reveal className="sec-tail">
          <p>
            LiteraAI fixes this — one interface where your documents and{" "}
            <b>240M+ academic papers</b> answer back, with citations attached.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
