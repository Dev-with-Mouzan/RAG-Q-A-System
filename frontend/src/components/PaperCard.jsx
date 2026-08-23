import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Reveal from "./Reveal";
import { toast } from "./ToastHost";
import { chatAboutPaper } from "../lib/api";
import { renderMarkdown } from "../lib/markdown";
import { useSettings } from "../lib/settings";
import { IconBot, IconExternal, IconSend, IconUser, IconX } from "../lib/icons";

const ease = [0.165, 0.84, 0.44, 1];

const SOURCE_LABEL = {
  arxiv: "arXiv",
  semantic: "Semantic Scholar",
  pubmed: "PubMed",
};

export default function PaperCard({ paper, index }) {
  const { configured } = useSettings();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  const link =
    paper.url ||
    (paper.arxiv_id ? `https://arxiv.org/abs/${paper.arxiv_id}` : null) ||
    (paper.doi ? `https://doi.org/${paper.doi}` : null);

  const badge = SOURCE_LABEL[paper.source] || paper.source || "Paper";

  useEffect(() => {
    if (chatOpen && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, thinking, chatOpen]);

  const send = async (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q || thinking || !configured) return;
    setInput("");
    const history = messages.map((m) => ({ role: m.role, content: m.text }));
    const next = [...messages, { role: "user", text: q }];
    setMessages(next);
    setThinking(true);
    try {
      const reply = await chatAboutPaper({ paper, query: q, history });
      setMessages([...next, { role: "assistant", text: reply }]);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setThinking(false);
    }
  };

  return (
    <Reveal delay={Math.min(index * 0.06, 0.4)} y={22}>
      <article className="paper-card">
        <div className="paper-top">
          <span className="paper-badge">{badge}</span>
          {!!paper.year && <span className="paper-year mono">{paper.year}</span>}
          {link && (
            <a href={link} target="_blank" rel="noopener" className="paper-link">
              Open source <IconExternal />
            </a>
          )}
        </div>

        <button
          type="button"
          className={`talk-btn${chatOpen ? " active" : ""}`}
          onClick={() => setChatOpen((v) => !v)}
          disabled={!configured}
          title={configured ? "Chat about this paper" : "Set your OpenAI API key in Settings first"}
        >
          <IconBot size={14} /> {chatOpen ? "Close chat" : "Talk about it"}
        </button>

        <h3 className="paper-title">{paper.title}</h3>
        {!!paper.authors?.length && (
          <p className="paper-authors">{paper.authors.slice(0, 5).join(", ")}{paper.authors.length > 5 ? " et al." : ""}</p>
        )}
        {paper.abstract && (
          <details className="paper-abstract">
            <summary>Abstract</summary>
            <p>{paper.abstract}</p>
          </details>
        )}

        <AnimatePresence initial={false}>
          {chatOpen && (
            <motion.div
              key="pc"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease }}
              style={{ overflow: "hidden" }}
            >
              <div className="paper-chat">
                <div className="pc-head mono">
                  <span className="pc-head-icon"><IconBot size={15} /></span>
                  Ask anything about this paper
                  <button
                    type="button"
                    className="pc-close"
                    onClick={() => setChatOpen(false)}
                    aria-label="Close chat"
                  >
                    <IconX size={11} />
                  </button>
                </div>

                <div className="pc-msgs">
                  {!messages.length && !thinking && (
                    <p className="pc-empty">
                      Ask about the method, results, or how it relates to your research…
                    </p>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`pc-msg ${m.role}`}>
                      <span className="pc-avatar">{m.role === "user" ? <IconUser size={13} /> : <IconBot size={13} />}</span>
                      <div className="pc-bubble" dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
                    </div>
                  ))}
                  {thinking && (
                    <div className="pc-msg assistant">
                      <span className="pc-avatar"><IconBot size={13} /></span>
                      <span className="pc-dots"><i /><i /><i /></span>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                <form className="pc-input-row" onSubmit={send}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={configured ? "Ask a question…" : "Set your API key in Settings"}
                    disabled={!configured || thinking}
                  />
                  <button type="submit" className="pc-send" disabled={!configured || thinking || !input.trim()}>
                    <IconSend size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </Reveal>
  );
}
