import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconX } from "../lib/icons";

export default function AnnouncementBar() {
  const [open, setOpen] = useState(true);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="announce"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: "hidden" }}
        >
          <div className="announce-inner">
            <span>
              New — multi-source research is live across arXiv, Semantic Scholar &amp; PubMed.{" "}
              <a
                href="#"
                className="announce-link"
                onClick={(e) => { e.preventDefault(); document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" }); }}
              >
                Explore the platform
              </a>
            </span>
            <button className="announce-close" aria-label="Dismiss" onClick={() => setOpen(false)}>
              <IconX />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
