import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Eyebrow from "../components/Eyebrow";
import ArrowButton from "../components/ArrowButton";
import Reveal from "../components/Reveal";
import SearchSkeleton from "../components/SearchSkeleton";
import PaperCard from "../components/PaperCard";
import { toast } from "../components/ToastHost";
import { searchPapers } from "../lib/api";
import { useSettings } from "../lib/settings";
import ApiWarning from "../components/ApiWarning";
import { IconSearch } from "../lib/icons";

const ease = [0.165, 0.84, 0.44, 1];

export default function SearchView({ source, navigate }) {
  const { configured } = useSettings();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");

  const execute = async (raw) => {
    const q = (raw ?? "").trim();
    if (!q || !configured || loading) return;
    setQuery(q);
    setLoading(true);
    setResults(null);
    setSearchedQuery(q);
    try {
      const r = await searchPapers(q, source);
      setResults(r);
      if (!r.length) toast("No results found — try broader keywords", "info");
    } catch (err) {
      toast(err.message, "error");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-main">
      <div className="container">
        <div className="app-head center">
          <Eyebrow>{SOURCE_META[source].eyebrow}</Eyebrow>
          <h1 className="app-title">{SOURCE_META[source].title}</h1>
          <p className="app-sub">{SOURCE_META[source].sub}</p>
        </div>

        {!configured && <ApiWarning navigate={navigate} />}

        <form
          className={`search-bar${loading ? " busy" : ""}`}
          onSubmit={(e) => {
            e.preventDefault();
            execute(query);
          }}
        >
          <span className="search-bar-icon"><IconSearch size={19} /></span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={configured ? SOURCE_META[source].placeholder : "Set your API key in Settings to start searching…"}
            disabled={!configured}
            autoFocus
          />
          <button type="submit" className="search-go" disabled={loading || !query.trim() || !configured}>
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        {!loading && results === null && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
            className="search-examples"
          >
            <span className="search-examples-label mono">Try:</span>
            {(SOURCE_META[source].examples || []).map((ex) => (
              <button
                key={ex}
                type="button"
                className="example-chip mono"
                onClick={() => execute(ex)}
                disabled={!configured}
              >
                {ex}
              </button>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="sk" exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <SearchSkeleton />
            </motion.div>
          )}

          {!loading && results !== null && (
            <motion.div
              key="res"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
              className="results-wrap"
            >
              <p className="results-count mono">
                {results.length} result{results.length === 1 ? "" : "s"} for &quot;{searchedQuery}&quot;
              </p>
              {results.length > 0 && (
                <div className="results-list">
                  {results.map((p, i) => (
                    <PaperCard key={p.id || i} paper={p} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

const SOURCE_META = {
  arxiv: {
    eyebrow: "arXiv Database",
    title: "Preprints, straight from the source.",
    sub: "Search 2.4M+ open-access preprints across physics, CS, math and more — ranked semantically.",
    placeholder: "e.g. attention is all you need",
    examples: [
      "attention is all you need",
      "transformer architectures",
      "reinforcement learning robotics",
    ],
  },
  semantic: {
    eyebrow: "Semantic Scholar",
    title: "200 million papers, one query.",
    sub: "AI-powered academic search across all disciplines with citation-aware relevance ranking.",
    placeholder: "e.g. protein folding deep learning",
    examples: [
      "protein folding deep learning",
      "large language models survey",
      "graph neural networks",
    ],
  },
  pubmed: {
    eyebrow: "PubMed / MEDLINE",
    title: "Evidence-based answers in medicine.",
    sub: "36M+ biomedical citations from life science journals and MEDLINE.",
    placeholder: "e.g. CRISPR gene therapy trials",
    examples: [
      "CRISPR gene therapy trials",
      "mRNA vaccine efficacy",
      "breast cancer immunotherapy",
    ],
  },
  hybrid: {
    eyebrow: "Hybrid Research Mode",
    title: "All sources. One question.",
    sub: "Query every connected database simultaneously — your PDF library plus the world's research.",
    placeholder: "e.g. transformer architectures for drug discovery",
    examples: [
      "attention is all you need",
      "protein folding deep learning",
      "CRISPR gene therapy trials",
    ],
  },
};
