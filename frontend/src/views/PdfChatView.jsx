import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ArrowButton from "../components/ArrowButton";
import Eyebrow from "../components/Eyebrow";
import { toast } from "../components/ToastHost";
import { queryPdf, formatBytes } from "../lib/api";
import { renderMarkdown, escapeHtml } from "../lib/markdown";
import { useSettings } from "../lib/settings";
import ApiWarning from "../components/ApiWarning";
import {
  IconUpload,
  IconSend,
  IconCopy,
  IconCheckSmall,
  IconFileX,
  IconX,
  IconBot,
  IconUser,
} from "../lib/icons";

const ease = [0.165, 0.84, 0.44, 1];

const SUGGESTIONS = [
  "Summarize this document in 5 bullet points",
  "What are the main conclusions?",
  "List the methodology used",
  "What are the limitations of this work?",
];

function Message({ msg, onCopy }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      className={`chat-msg ${isUser ? "user" : "bot"}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      <span className={`msg-avatar ${isUser ? "user" : "bot"}`}>
        {isUser ? <IconUser /> : <IconBot />}
      </span>
      <div className="msg-bubble">
        {isUser ? (
          <p>{escapeHtml(msg.text)}</p>
        ) : msg.loading ? (
          <div className="typing-dots"><i /><i /><i /></div>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }} />
            {!!msg.sources?.length && (
              <div className="msg-sources">
                {msg.sources.map((s, i) => (
                  <span key={i} className="src-chip">{s.title || s.source || `Source ${i + 1}`}</span>
                ))}
              </div>
            )}
            <button className="msg-copy" onClick={() => onCopy(msg)} title="Copy answer">
              <IconCopy />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function PdfChatView({ status, setStatus, navigate }) {
  const { configured } = useSettings();
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  useEffect(scrollDown, [messages, scrollDown]);

  const acceptFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast("Only PDF files are supported", "error");
      return;
    }
    setFile(f);
    setMessages([]);
    toast(`Loaded "${f.name}"`, "success");
  };

  const send = async (rawText) => {
    const text = (rawText ?? input).trim();
    if (!text || !file || !configured) return;

    setInput("");
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "assistant", loading: true },
    ]);
    setStatus("busy");

    try {
      const data = await queryPdf({
        query: text,
        file: messages.length === 0 ? file : undefined,
        pdfName: messages.length === 0 ? undefined : file.name,
        sourceType: "user",
      });
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: "assistant",
          text: data.response || data.answer || "No answer returned.",
          sources: data.sources || [],
        };
        return next;
      });
      setStatus("ready");
    } catch (err) {
      setMessages((m) => {
        const next = [...m];
        next[next.length - 1] = {
          role: "assistant",
          text: `Sorry — something went wrong: ${err.message}`,
          error: true,
        };
        return next;
      });
      setStatus("error");
      toast(err.message, "error");
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  return (
    <main className="app-main">
      <div className="container-narrow">
        <div className="app-head">
          <Eyebrow>Chat With Your PDFs</Eyebrow>
          <h1 className="app-title">Ask your document anything.</h1>
          <p className="app-sub">
            Upload a paper and LiteraAI retrieves the exact passages before answering — grounded,
            cited, no hallucinations.
          </p>
        </div>

        {!configured && <ApiWarning navigate={navigate} />}

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div key="drop" exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div
                className={`upload-zone${dragOver ? " over" : ""}`}
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
              >
                <motion.span
                  className="upload-icon"
                  animate={dragOver ? { y: [-2, -10, -2] } : {}}
                  transition={{ duration: 0.6, repeat: dragOver ? Infinity : 0 }}
                >
                  <IconUpload size={34} />
                </motion.span>
                <h3>Drag &amp; drop your PDF here</h3>
                <p>or <b>browse files</b> — processed locally, nothing leaves your machine.</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  hidden
                  onChange={(e) => acceptFile(e.target.files?.[0])}
                />
              </div>
              <p className="upload-hint mono">PDF only &middot; max ~50MB &middot; parsed &amp; embedded locally</p>
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              className="chat-panel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}
            >
              <div className="chat-doc-bar">
                <span className="doc-chip">
                  <IconFileX size={18} />
                  {file.name}
                </span>
                <span className="doc-size mono">{formatBytes(file.size)}</span>
                <button
                  className="doc-remove"
                  onClick={() => { setFile(null); setMessages([]); }}
                  title="Remove document"
                >
                  <IconX />
                </button>
              </div>

              <div className="chat-scroll">
                {messages.length === 0 ? (
                  <div className="chat-empty">
                    <p>Start by asking a question about <b>{file.name}</b></p>
                    <div className="suggestion-row">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} className="suggestion-chip" onClick={() => send(s)} disabled={!configured}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <Message
                      key={i}
                      msg={m}
                      onCopy={(msg) => {
                        navigator.clipboard.writeText(msg.text);
                        toast("Copied to clipboard", "success");
                      }}
                    />
                  ))
                )}
                <div ref={bottomRef} />
              </div>

              <form
                className="chat-input-row"
                onSubmit={(e) => { e.preventDefault(); send(); }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={configured ? "Ask about this document…" : "Set your API key in Settings to start chatting…"}
                  disabled={status === "busy" || !configured}
                  autoFocus
                />
                <ArrowButton small type="submit" disabled={!configured || status === "busy"}>
                  Send
                </ArrowButton>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
