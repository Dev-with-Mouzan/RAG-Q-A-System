import { motion } from "framer-motion";

export function ArrowIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 14" fill="none" aria-hidden="true">
      <path
        d="M8.45484 13.7875L7.04208 12.3735L9.45245 9.97175C10.1105 9.31494 10.8565 8.62715 11.5629 7.96786C10.9817 7.9976 10.3732 8.0261 9.80068 8.0261H0.757751V5.97388H9.80068C10.372 5.97388 10.9817 6.00238 11.553 6.03212C10.8466 5.37283 10.1105 4.69619 9.45245 4.0369L7.04208 1.63644L8.45484 0.212524L15.2423 6.99999L8.45484 13.7875Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Signature 101gen.ai button: maroon block, icon square on the right,
 * white panel sweeps in from the right on hover and text flips to maroon.
 */
export default function ArrowButton({ children, onClick, className = "", small = false, white = false, type = "button", disabled = false }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`btn101${small ? " small" : ""}${white ? " cta-btn-white" : ""} ${className}`}
      disabled={disabled}
    >
      <span className="btn101-bg" />
      <span className="btn101-text">{children}</span>
      <span className="btn101-icon">
        <ArrowIcon size={small ? 13 : 15} />
      </span>
    </motion.button>
  );
}
