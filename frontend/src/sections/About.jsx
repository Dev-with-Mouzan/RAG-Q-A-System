import Eyebrow from "../components/Eyebrow";
import SplitText from "../components/SplitText";
import Reveal, { Stagger, StaggerItem } from "../components/Reveal";

const STATS = [
  { value: "4", label: "Integrated sources" },
  { value: "240M+", label: "Papers reachable" },
  { value: "<2s", label: "Typical retrieval" },
  { value: "100%", label: "Cited responses" },
];

export default function About() {
  return (
    <section className="section about-sec">
      <div className="container">
        <div className="about-grid">
          <div className="sec-head on-dark left">
            <Eyebrow dark>Why LiteraAI</Eyebrow>
            <h2 className="sec-title light">
              <SplitText text="Retrieval you can" />
              <br />
              <SplitText text="actually trust." className="accent" as="span" />
            </h2>
          </div>
          <Reveal delay={0.15}>
            <p className="about-copy">
              LiteraAI was built on a simple conviction: AI answers in research are only useful
              when you can check them. Every response is generated from retrieved passages —
              never from thin air — whether those passages come from your own PDF library or
              the world&apos;s largest academic databases.
            </p>
            <p className="about-copy">
              Under the hood it&apos;s a modern, open stack: FastAPI serves a LangChain
              retrieval pipeline over FAISS vector stores, with OpenAI GPT models doing the final generation. No black boxes.
            </p>
          </Reveal>
        </div>

        <Stagger className="about-stats">
          {STATS.map((s) => (
            <StaggerItem key={s.label}>
              <div className="about-stat">
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
