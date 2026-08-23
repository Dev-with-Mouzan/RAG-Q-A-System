import { IconExternal } from "../lib/icons";

export default function Footer({ navigate }) {
  const stop = (fn) => (e) => {
    e.preventDefault();
    fn();
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-col">
            <a href="#" className="footer-brand" onClick={stop(() => navigate("home"))}>
              <img src="/logo.png" alt="LiteraAI logo" className="brand-logo" />
              <span>LiteraAI</span>
            </a>
            <p className="footer-tagline">
              AI-powered answers grounded in real research. Chat with your PDFs or search across the
              world&apos;s academic databases — arXiv, Semantic Scholar and PubMed.
            </p>
          </div>

          <nav className="footer-col" aria-label="Sources">
            <h4>Research Sources</h4>
            <ul>
              <li><a href="#" onClick={stop(() => navigate("pdf"))}>Your PDFs</a></li>
              <li><a href="#" onClick={stop(() => navigate("arxiv"))}>arXiv</a></li>
              <li><a href="#" onClick={stop(() => navigate("semantic"))}>Semantic Scholar</a></li>
              <li><a href="#" onClick={stop(() => navigate("pubmed"))}>PubMed</a></li>
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Product">
            <h4>Product</h4>
            <ul>
              <li><a href="#" onClick={stop(() => navigate("hybrid"))}>Hybrid Search</a></li>
              <li><a href="#" onClick={stop(() => navigate("knowledge"))}>Knowledge Base</a></li>
              <li><a href="#" onClick={stop(() => navigate("settings"))}>Settings</a></li>
            </ul>
          </nav>

          <nav className="footer-col" aria-label="Stack">
            <h4>Built With</h4>
            <ul>
              <li><a href="https://fastapi.tiangolo.com" target="_blank" rel="noopener">FastAPI <IconExternal /></a></li>
              <li><a href="https://www.langchain.com" target="_blank" rel="noopener">LangChain <IconExternal /></a></li>
              <li><a href="https://faiss.ai" target="_blank" rel="noopener">FAISS <IconExternal /></a></li>
              <li><a href="https://openai.com" target="_blank" rel="noopener">OpenAI GPT <IconExternal /></a></li>
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2026 LiteraAI &middot; Research made accessible</span>
          <span className="mono">RAG &middot; FAISS &middot; LangChain &middot; FastAPI</span>
        </div>
      </div>
    </footer>
  );
}
