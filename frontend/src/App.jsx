import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnnouncementBar from "./components/AnnouncementBar";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ToastHost, { toast } from "./components/ToastHost";
import HomeView from "./views/HomeView";
import PdfChatView from "./views/PdfChatView";
import SearchView from "./views/SearchView";
import KnowledgeView from "./views/KnowledgeView";
import SettingsView from "./views/SettingsView";

const VALID_VIEWS = new Set(["home", "pdf", "arxiv", "semantic", "pubmed", "hybrid", "knowledge", "settings"]);

function viewFromHash() {
  const h = window.location.hash.replace("#/", "").replace("#", "");
  return VALID_VIEWS.has(h) ? h : "home";
}

const ease = [0.165, 0.84, 0.44, 1];

export default function App() {
  const [view, setView] = useState(viewFromHash);
  const [status, setStatus] = useState("ready");

  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = useCallback((next) => {
    if (!VALID_VIEWS.has(next)) return;
    setView(next);
    window.location.hash = next === "home" ? "/" : `/${next}`;
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    setStatus("ready");
  }, []);

  return (
    <div className="app">
      <AnnouncementBar />
      <Navbar view={view} navigate={navigate} status={status} />

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease }}
        >
          {view === "home" && <HomeView navigate={navigate} />}
          {view === "pdf" && <PdfChatView status={status} setStatus={setStatus} navigate={navigate} />}
          {(view === "arxiv" || view === "semantic" || view === "pubmed" || view === "hybrid") && (
            <SearchView source={view} navigate={navigate} />
          )}
          {view === "knowledge" && <KnowledgeView navigate={navigate} />}
          {view === "settings" && <SettingsView />}
        </motion.div>
      </AnimatePresence>

      {view !== "home" && (
        <section className="app-cta-strip">
          <div className="container app-cta-inner">
            <p>Ready to go deeper?</p>
            <button className="btn-flat" onClick={() => navigate("home")}>
              Back to overview <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      )}

      <Footer navigate={navigate} />
      <ToastHost />
    </div>
  );
}
