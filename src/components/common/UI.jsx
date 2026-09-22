import { useEffect, useId, useRef } from "react";
import { Link } from "react-router";
import Icon from "./Icon";
export function Logo() {
  return (
    <Link to="/" className="brand" aria-label="Wally Mall beranda">
      wally<span className="brand-dot">.</span>
      <small>MALL</small>
    </Link>
  );
}
export function SectionHeading({ eyebrow, title, link, to }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {link || "Lihat semua"}
          <Icon name="arrow" size={17} />
        </Link>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  text,
  to = "/explore",
  label = "Jelajahi Wally",
  icon = "search",
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon name={icon} size={34} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      <Link className="btn btn-primary" to={to}>
        {label}
        <Icon name="arrow" />
      </Link>
    </div>
  );
}
export function Modal({ title, onClose, children, sheet = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    d.showModal();
    return () => d.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`modal modal-open ${sheet ? "filter-modal" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <div className="modal-heading">
          <h2 id={titleId}>{title}</h2>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Tutup dialog"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
