import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Eyebrow from "../components/Eyebrow";
import ArrowButton from "../components/ArrowButton";
import { toast } from "../components/ToastHost";
import { getConversations, deleteConversation, formatDate } from "../lib/api";
import { IconTrash, IconPdf, IconSearch } from "../lib/icons";

const ease = [0.165, 0.84, 0.44, 1];

const TYPE_META = {
  user: { label: "PDF Chat", icon: <IconPdf size={14} /> },
  arxiv: { label: "arXiv", icon: <IconSearch size={14} /> },
  semantic: { label: "Semantic Scholar", icon: <IconSearch size={14} /> },
  pubmed: { label: "PubMed", icon: <IconSearch size={14} /> },
  hybrid: { label: "Hybrid", icon: <IconSearch size={14} /> },
};

export default function KnowledgeView({ navigate }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    try {
      setItems(await getConversations());
    } catch (err) {
      setError(err.message);
      toast(err.message, "error");
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    setDeleting(id);
    try {
      await deleteConversation(id);
      setItems((list) => list.filter((c) => c.id !== id));
      toast("Conversation deleted", "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main className="app-main">
      <div className="container-narrow">
        <div className="app-head">
          <Eyebrow>Knowledge Base</Eyebrow>
          <h1 className="app-title">Your research library.</h1>
          <p className="app-sub">Every conversation and document, stored locally in SQLite — yours to keep or delete.</p>
        </div>

        {items === null && !error && (
          <div className="skeleton-list" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <motion.div key={i} className="skeleton-card conv-sk"
                initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}>
                <div className="sk-line w-50" />
                <div className="sk-line w-80" />
              </motion.div>
            ))}
          </div>
        )}

        {error && (
          <div className="kb-empty">
            <p>Couldn&apos;t reach the backend.</p>
            <p className="mono kb-hint">Start it with: uvicorn backend.main:app --reload</p>
          </div>
        )}

        {Array.isArray(items) && items.length === 0 && (
          <div className="kb-empty">
            <h3>Nothing here yet</h3>
            <p>Start a conversation and it will appear in your knowledge base automatically.</p>
            <ArrowButton small onClick={() => navigate("pdf")}>Start Chatting</ArrowButton>
          </div>
        )}

        {Array.isArray(items) && items.length > 0 && (
          <div className="kb-list">
            <AnimatePresence initial={false}>
              {items.map((c) => {
                const meta = TYPE_META[c.source_type || "user"] || TYPE_META.user;
                return (
                  <motion.article
                    key={c.id}
                    className="kb-item"
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: deleting === c.id ? 0.4 : 1, y: 0 }}
                    exit={{ opacity: 0, x: -40, height: 0 }}
                    transition={{ duration: 0.35, ease }}
                  >
                    <span className="kb-type">{meta.icon}{meta.label}</span>
                    <div className="kb-body">
                      <h3>{c.title || "Untitled conversation"}</h3>
                      <p className="kb-meta mono">
                        {c.message_count ?? "?"} messages &middot; updated {formatDate(c.updated_at || c.created_at)}
                      </p>
                    </div>
                    <button
                      className="kb-delete"
                      onClick={() => remove(c.id)}
                      disabled={deleting === c.id}
                      title="Delete conversation"
                    >
                      <IconTrash />
                    </button>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
