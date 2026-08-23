import Eyebrow from "../components/Eyebrow";
import { Stagger, StaggerItem } from "../components/Reveal";
import SplitText from "../components/SplitText";
import {
  IconShield,
  IconDatabase,
  IconKey,
  IconCpu,
  IconGit,
  IconGlobe,
} from "../lib/icons";

const CARDS = [
  {
    icon: <IconShield />,
    title: "Local-first processing",
    body: "Your PDFs are parsed and embedded on your own machine. Documents never leave your environment unless you query a public API.",
  },
  {
    icon: <IconDatabase />,
    title: "Private history",
    body: "Conversations live in a local SQLite database you control — no third-party analytics, no cloud sync you didn't ask for.",
  },
  {
    icon: <IconKey />,
    title: "Bring your own keys",
    body: "Your OpenAI API key stays in your settings. Nothing is phoned home, nothing is shared across users.",
  },
  {
    icon: <IconCpu />,
    title: "Flexible model backend",
    body: "Use any OpenAI chat or embedding model — type the exact model name in Settings. Your infrastructure, your rules.",
  },
  {
    icon: <IconGit />,
    title: "Open, inspectable stack",
    body: "FastAPI + LangChain + FAISS — standard, well-documented components you can audit, extend, and self-host anywhere.",
  },
  {
    icon: <IconGlobe />,
    title: "Read-only public sources",
    body: "Academic searches hit public APIs read-only with plain-text queries — no personal data is attached to research lookups.",
  },
];

export default function Security() {
  return (
    <section className="section secure-sec">
      <div className="container">
        <div className="sec-head">
          <Eyebrow>Trust &amp; Privacy</Eyebrow>
          <h2 className="sec-title">
            <SplitText text="Research-grade privacy," />
            <br />
            <SplitText text="by default." className="accent" as="span" />
          </h2>
        </div>

        <Stagger className="secure-grid" gap={0.1}>
          {CARDS.map((c) => (
            <StaggerItem key={c.title}>
              <article className="secure-card">
                <span className="secure-icon">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
