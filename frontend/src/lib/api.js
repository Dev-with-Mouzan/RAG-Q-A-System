import { getSnapshot } from "./settings";

const base = "";

function appendProviderSettings(fd) {
  const s = getSnapshot();
  fd.append("provider", "openai");
  if (s?.model) fd.append("model", s.model);
  if (s?.embeddingModel) fd.append("embedding_model", s.embeddingModel);
  if (s?.apiKey) fd.append("api_key", s.apiKey);
}

export async function queryPdf({ query, file, pdfName, sourceType = "user", conversationId }) {
  const fd = new FormData();
  fd.append("query", query);
  fd.append("source_type", sourceType);
  if (file) fd.append("file", file);
  if (pdfName) fd.append("pdf_name", pdfName);
  if (conversationId) fd.append("conversation_id", conversationId);
  appendProviderSettings(fd);
  const r = await fetch("/query", { method: "POST", body: fd });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.detail || "Request failed");
  return data;
}

export async function searchPapers(q, source) {
  const r = await fetch(`/search?q=${encodeURIComponent(q)}&source=${source}`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.detail || "Search failed");
  return data.results || [];
}

export async function chatAboutPaper({ paper, query, history = [] }) {
  const s = getSnapshot();
  const r = await fetch("/paper-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      paper,
      query,
      messages: history.slice(-10),
      ...(s?.model ? { model: s.model } : {}),
      ...(s?.apiKey ? { api_key: s.apiKey } : {}),
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.detail || "Chat request failed");
  return data.response;
}

export async function getConversations() {
  const r = await fetch("/api/conversations");
  if (!r.ok) throw new Error("Failed to load conversations");
  return r.json();
}

export async function deleteConversation(id) {
  const r = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Delete failed");
  return true;
}

export function formatBytes(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

export function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(s) {
  const d = new Date(s);
  const n = new Date();
  const diff = (n - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}
