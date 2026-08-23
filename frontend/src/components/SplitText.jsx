import { motion } from "framer-motion";

const letterVariants = {
  hidden: { opacity: 0, y: "0.6em" },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.016, duration: 0.55, ease: [0.165, 0.84, 0.44, 1] },
  }),
};

/**
 * Letter-by-letter reveal (like 101gen.ai js-letter-animation).
 * Animates when scrolled into view.
 */
export default function SplitText({ text, className = "", as = "span", delay = 0 }) {
  const words = text.split(" ");
  let letterIndex = 0;
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      aria-label={text}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
    >
      {words.map((word, wi) => (
        <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }} aria-hidden="true">
          {word.split("").map((ch, ci) => {
            const idx = delay + letterIndex++;
            return (
              <motion.span
                key={ci}
                custom={idx}
                variants={letterVariants}
                style={{ display: "inline-block", willChange: "transform, opacity" }}
              >
                {ch}
              </motion.span>
            );
          })}
          {wi < words.length - 1 ? <span>&nbsp;</span> : null}
        </span>
      ))}
    </MotionTag>
  );
}
