import { motion } from "framer-motion";

export default function SearchSkeleton() {
  return (
    <div className="skeleton-list" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="skeleton-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.35, 0.75, 0.35] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
        >
          <div className="sk-line w-70" />
          <div className="sk-line w-100" />
          <div className="sk-line w-90" />
          <div className="sk-line w-40" />
        </motion.div>
      ))}
    </div>
  );
}
