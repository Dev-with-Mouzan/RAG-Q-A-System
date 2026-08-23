import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ArrowButton from "./ArrowButton";
import { IconChevronDown, IconSettings } from "../lib/icons";
import { useSettings } from "../lib/settings";

const SOURCES = [
  { id: "pdf", label: "Chat with PDFs" },
  { id: "arxiv", label: "arXiv" },
  { id: "semantic", label: "Semantic Scholar" },
  { id: "pubmed", label: "PubMed" },
  { id: "hybrid", label: "Hybrid Search" },
];

export default function Navbar({ view, navigate, status }) {
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);
  const { configured } = useSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("pointerdown", onClick);
    return () => document.removeEventListener("pointerdown", onClick);
  }, []);

  const go = (id) => {
    setMobileOpen(false);
    setDropOpen(false);
    if (id === "platform") {
      if (view !== "home") {
        navigate("home");
        setTimeout(() => {
          document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" });
        }, 120);
      } else {
        document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    navigate(id);
  };

  return (
    <div className="nav-wrap">
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-container">
          <a
            href="#"
            className="nav-brand"
            onClick={(e) => { e.preventDefault(); go("home"); }}
          >
            <img src="/logo.png" alt="LiteraAI logo" className="brand-logo" />
            <span>LiteraAI</span>
          </a>

          <div className="nav-links">
            <button className={`nav-link${view === "home" ? " active" : ""}`} onClick={() => go("home")}>
              Home
            </button>
            <button className="nav-link" onClick={() => go("platform")}>
              Platform
            </button>
            <div className="nav-dropdown-wrap" ref={dropRef}>
              <button className={`nav-link${SOURCES.some((s) => s.id === view) ? " active" : ""}`} onClick={() => setDropOpen((v) => !v)}>
                Sources
                <span className={`nav-caret${dropOpen ? " open" : ""}`}>
                  <IconChevronDown />
                </span>
              </button>
              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    className="nav-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.165, 0.84, 0.44, 1] }}
                  >
                    {SOURCES.map((s) => (
                      <button key={s.id} className="nav-dropdown-item" onClick={() => go(s.id)}>
                        {s.label}
                      </button>
                    ))}
                    <button className="nav-dropdown-item" onClick={() => go("knowledge")}>
                      Knowledge Base
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className={`nav-link${view === "knowledge" ? " active" : ""}`} onClick={() => go("knowledge")}>
              Knowledge
            </button>
          </div>

          <div className="nav-right">
            <span className="status-pill">
              <span className={`status-dot ${status}`} />
              {status === "busy" ? "Processing" : status === "error" ? "Error" : configured ? "Ready" : "No API key"}
            </span>
            <button
              className={`nav-icon-btn${configured ? "" : " attention"}`}
              onClick={() => go("settings")}
              aria-label="Settings"
              title={configured ? "Settings" : "Set your API key"}
            >
              <IconSettings size={18} />
            </button>
            <ArrowButton small onClick={() => go("pdf")}>Launch App</ArrowButton>
            <button
              className={`nav-burger${mobileOpen ? " open" : ""}`}
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="nav-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.165, 0.84, 0.44, 1] }}
            style={{ overflow: "hidden" }}
          >
            {[{ id: "home", label: "Home" }, ...SOURCES.map((s) => ({ id: s.id, label: s.label })), { id: "knowledge", label: "Knowledge Base" }, { id: "settings", label: `Settings${configured ? "" : " — API key required"}` }].map((l) => (
              <button key={l.id} className={`nav-link${view === l.id ? " active" : ""}`} onClick={() => go(l.id)}>
                {l.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
