export function renderMarkdown(t) {
  let h = escapeHtml(t);
  h = h.replace(/```(\w*)\n?([\s\S]*?)```/g, "<pre><code>$2</code></pre>");
  h = h.replace(/`([^`]+)`/g, "<code>$1</code>");
  h = h.replace(/### (.+)/g, "<h3>$1</h3>");
  h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  h = h.replace(/\n/g, "<br>");
  return h;
}

export function escapeHtml(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}
