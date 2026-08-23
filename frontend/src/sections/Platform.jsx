import { motion } from "framer-motion";
import Eyebrow from "../components/Eyebrow";
import Reveal, { Stagger, StaggerItem } from "../components/Reveal";
import SplitText from "../components/SplitText";
import { IconUpload, IconDatabase, IconSearch, IconBot } from "../lib/icons";

const ease = [0.165, 0.84, 0.44, 1];

const STEPS = [
  { icon: <IconUpload size={20} />, label: "Ingest", desc: "PDFs parsed & chunked" },
  { icon: <IconDatabase size={20} />, label: "Index", desc: "FAISS vector store" },
  { icon: <IconSearch size={20} />, label: "Retrieve", desc: "Top-k semantic matches" },
  { icon: <IconBot size={20} />, label: "Generate", desc: "Grounded LLM answer" },
];

const FEATURES = [
  {
    title: "Chat with any PDF",
    body: "Upload a paper and ask questions in plain language. LiteraAI chunks, embeds and retrieves exactly the passages that answer you — page-level citations included.",
    tag: "RAG + FAISS",
  },
  {
    title: "240M+ papers, one query box",
    body: "Search arXiv, Semantic Scholar and PubMed simultaneously or individually. Results come back ranked by relevance with abstracts and direct links.",
    tag: "Multi-source APIs",
  },
  {
    title: "Hybrid research mode",
    body: "Combine your private library with public literature. The retriever merges both corpora so answers bridge your notes and the state of the art.",
    tag: "Federated retrieval",
  },
  {
    title: "Persistent knowledge base",
    body: "Every conversation and uploaded document is stored in SQLite. Revisit past sessions, manage your library, and pick up long-running projects where you left off.",
    tag: "SQLite persistence",
  },
];

function Pipeline() {
  return (
    <div className="pipeline">
      {STEPS.map((step, i) => (
        <div key={step.label} className="pipeline-step-wrap">
          <Reveal delay={i * 0.14}>
            <div className="pipeline-step">
              <span className="pipeline-icon">{step.icon}</span>
              <b>{step.label}</b>
              <small>{step.desc}</small>
            </div>
          </Reveal>
          {i < STEPS.length - 1 && (
            <div className="pipeline-connector">
              <motion.span
                className="pipeline-pulse"
                animate={{ left: ["0%", "calc(100% - 10px)"], opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  repeatDelay: 2.2,
                  delay: i * 0.35,
                  ease: "easeInOut",
                  times: [0, 0.15, 0.85, 1],
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Platform() {
  return (
    <section className="section platform-sec" id="platform">
      <div className="container">
        <div className="sec-head on-dark">
          <Eyebrow dark>The Platform</Eyebrow>
          <h2 className="sec-title light">
            <SplitText text="From question to cited answer," />
            <br />
            <SplitText text="in one pipeline." className="accent" as="span" />
          </h2>
        </div>

        <Pipeline />

        <Stagger className="platform-grid">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <article className="platform-card">
                <span className="platform-tag mono">{f.tag}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
