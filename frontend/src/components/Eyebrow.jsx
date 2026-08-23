export default function Eyebrow({ children, dark = false }) {
  return (
    <div className="eyebrow-row">
      <span className={`eyebrow${dark ? " on-dark" : ""}`}>
        <span className="eyebrow-dot" />
        {children}
      </span>
    </div>
  );
}
