import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

let listeners = [];
let toasts = [];
let nextId = 1;

export function toast(msg, type = "info") {
  const t = { id: nextId++, msg, type };
  toasts = [...toasts, t];
  listeners.forEach((l) => l(toasts));
  setTimeout(() => dismissToast(t.id), 3200);
}

export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((l) => l(toasts));
}

export default function ToastHost() {
  const [items, setItems] = useState(toasts);

  useEffect(() => {
    const l = (next) => setItems([...next]);
    listeners.push(l);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);

  return (
    <div className="toast-host" role="status" aria-live="polite">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`toast ${t.type}`}
          >
            {t.msg}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
