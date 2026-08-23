import { motion } from "framer-motion";
import ArrowButton, { ArrowIcon } from "../components/ArrowButton";
import Eyebrow from "../components/Eyebrow";
import SplitText from "../components/SplitText";
import Reveal from "../components/Reveal";
import { IconPdf, IconSearch, IconLayers, IconDna } from "../lib/icons";

const ease = [0.165, 0.84, 0.44, 1];

const SOURCES = [
  { icon: <IconSearch size={16} />, name: "arXiv", meta: "2.4M+ papers" },
  { icon: <IconLayers size={16} />, name: "Semantic Scholar", meta: "200M+ papers" },
  { icon: <IconDna size={16} />, name: "PubMed", meta: "36M+ articles" },
  { icon: <IconPdf size={16} />, name: "Your PDFs", meta: "Unlimited" },
];

function MockSource({ icon, name, meta, delay }) {
  return (
    <motion.div
      className="mock-source"
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6, ease }}
    >
      <span className="mock-source-icon">{icon}</span>
      <div>
        <b>{name}</b>
        <small>{meta}</small>
      </div>
      <motion.span
        className="scanline"
        animate={{ y: ["-100%", "220%"] }}
        transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 3.4, delay: delay + 1.2, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function HeroMock() {
  return (
    <div className="hero-mock">
      <div className="mock-side">
        <div className="mock-side-label">Connected sources</div>
        {SOURCES.map((s, i) => (
          <MockSource key={s.name} {...s} delay={0.5 + i * 0.18} />
        ))}
      </div>

      <motion.div
        className="mock-chat"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.7, ease }}
      >
        <motion.div
          className="mock-msg user"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5, ease }}
        >
          What methodology did the 2024 attention-efficiency papers use?
        </motion.div>

        <motion.div
          className="mock-typing"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: 1.5, duration: 2.6, times: [0, 0.1, 0.85, 1], repeat: Infinity, repeatDelay: 0.4 }}
        >
          <motion.i animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0 }} />
          <motion.i animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0.12 }} />
          <motion.i animate={{ y: [0, -4, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0.24 }} />
        </motion.div>

        <motion.div
          className="mock-msg bot"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.6, ease }}
        >
          The top-cited 2024 work combines sparse attention with KV-cache pruning — evaluated on
          three long-context benchmarks.
          <br />
          <span className="mock-cite">arXiv · 2401.03662</span>
          <span className="mock-cite">Semantic Scholar</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function Hero({ navigate }) {
  return (
    <header className="hero">
      <div className="container">
        <Eyebrow>AI-Powered Research Assistant</Eyebrow>

        <div className="hero-head">
          <h1 className="hero-title">
            <SplitText text="Talk to your documents." />
            <br />
            <SplitText text="Search the world's research." className="accent" delay={10} as="span" />
          </h1>
          <SplitText
            text="Upload any PDF or query arXiv, Semantic Scholar and PubMed — grounded, citation-backed answers powered by RAG, FAISS and OpenAI GPT models."
            as="p"
            className="hero-para"
            delay={26}
          />

          <Reveal delay={0.9}>
            <div className="hero-actions">
              <ArrowButton onClick={() => navigate("pdf")}>Start Chatting</ArrowButton>
              <button
                className="btn-ghost"
                onClick={() => document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore the platform <ArrowIcon size={13} />
              </button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={40}>
          <div className="hero-stats">
            <div className="hero-stat"><b>4</b><span>Data Sources</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><b>240M+</b><span>Papers Indexed</span></div>
            <div className="hero-stat-divider" />
            <div className="hero-stat"><b>100%</b><span>Grounded Answers</span></div>
          </div>
        </Reveal>

        <Reveal delay={0.25} y={50}>
          <div className="hero-visual">
            <motion.div
              className="hero-floating-chip chip-a"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              Grounded answers, always cited
            </motion.div>
            <motion.div
              className="hero-floating-chip chip-b mono"
              style={{ fontFamily: "var(--font-mono)" }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            >
              RAG &middot; FAISS &middot; LLM
            </motion.div>
            <HeroMock />
          </div>
        </Reveal>
      </div>
    </header>
  );
}
