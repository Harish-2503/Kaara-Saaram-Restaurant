// src/admin/components/StatusBadge.jsx
const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  confirmed: { label: "Confirmed", color: "#6ee7b7", bg: "rgba(110,231,183,0.12)" },
  completed: { label: "Completed", color: "#93c5fd", bg: "rgba(147,197,253,0.12)" },
  rejected:  { label: "Rejected",  color: "#fca5a5", bg: "rgba(252,165,165,0.12)" },
  active:    { label: "Active",    color: "#6ee7b7", bg: "rgba(110,231,183,0.12)" },
  inactive:  { label: "Inactive",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  veg:       { label: "Veg",       color: "#86efac", bg: "rgba(134,239,172,0.12)" },
  "non-veg": { label: "Non-Veg",   color: "#fca5a5", bg: "rgba(252,165,165,0.12)" },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#D4AF37", bg: "rgba(212,175,55,0.1)" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: "0.68rem",
        fontWeight: 600,
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.color}30`,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
      {cfg.label}
    </span>
  );
}
