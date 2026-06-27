// src/admin/components/AdminField.jsx
// Reusable styled form field for admin forms

const fieldStyle = {
  background: "rgba(255,248,240,0.04)",
  border: "1px solid rgba(212,175,55,0.15)",
  borderRadius: 8,
  color: "#FFF8F0",
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.85rem",
  padding: "0.55rem 0.85rem",
  width: "100%",
  outline: "none",
  transition: "border-color 0.2s",
};

const labelStyle = {
  display: "block",
  fontSize: "0.7rem",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  color: "rgba(212,175,55,0.7)",
  letterSpacing: "0.09em",
  textTransform: "uppercase",
  marginBottom: 5,
};

export function AdminInput({ label, ...props }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        {...props}
        style={fieldStyle}
        onFocus={(e) => { e.target.style.borderColor = "rgba(212,175,55,0.5)"; }}
        onBlur={(e) => { e.target.style.borderColor = "rgba(212,175,55,0.15)"; }}
      />
    </div>
  );
}

export function AdminTextarea({ label, rows = 3, ...props }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        rows={rows}
        {...props}
        style={{ ...fieldStyle, resize: "vertical" }}
        onFocus={(e) => { e.target.style.borderColor = "rgba(212,175,55,0.5)"; }}
        onBlur={(e) => { e.target.style.borderColor = "rgba(212,175,55,0.15)"; }}
      />
    </div>
  );
}

export function AdminSelect({ label, options = [], ...props }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <select
        {...props}
        style={{
          ...fieldStyle,
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23D4AF37' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.85rem center",
          paddingRight: "2rem",
          cursor: "pointer",
        }}
        onFocus={(e) => { e.target.style.borderColor = "rgba(212,175,55,0.5)"; }}
        onBlur={(e) => { e.target.style.borderColor = "rgba(212,175,55,0.15)"; }}
      >
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o} style={{ background: "#2a1010", color: "#FFF8F0" }}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value} style={{ background: "#2a1010", color: "#FFF8F0" }}>
              {o.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}

export function AdminToggle({ label, checked, onChange, color = "#D4AF37" }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div
          className="w-10 h-5 rounded-full transition-all duration-300"
          style={{
            background: checked
              ? `linear-gradient(90deg, #8B0000, ${color})`
              : "rgba(255,248,240,0.1)",
            border: `1px solid ${checked ? color + "50" : "rgba(255,248,240,0.15)"}`,
          }}
        />
        <div
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-300"
          style={{
            background: checked ? "#FFF8F0" : "rgba(255,248,240,0.35)",
            transform: checked ? "translateX(20px)" : "translateX(0)",
            boxShadow: checked ? `0 0 6px ${color}60` : "none",
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: "0.8rem", color: "rgba(255,248,240,0.6)", fontFamily: "'Inter', sans-serif" }}>
          {label}
        </span>
      )}
    </label>
  );
}

export function AdminBtn({ children, variant = "primary", size = "md", ...props }) {
  const base = {
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    transition: "all 0.2s",
    letterSpacing: "0.03em",
    fontSize: size === "sm" ? "0.75rem" : "0.85rem",
    padding: size === "sm" ? "0.35rem 0.8rem" : "0.6rem 1.3rem",
  };

  const variants = {
    primary: {
      background: "linear-gradient(135deg, #8B0000, #D4AF37)",
      color: "#FFF8F0",
      boxShadow: "0 4px 14px rgba(139,0,0,0.3)",
    },
    secondary: {
      background: "rgba(212,175,55,0.08)",
      color: "#D4AF37",
      border: "1px solid rgba(212,175,55,0.25)",
    },
    danger: {
      background: "rgba(185,28,28,0.15)",
      color: "#fca5a5",
      border: "1px solid rgba(185,28,28,0.3)",
    },
    ghost: {
      background: "transparent",
      color: "rgba(255,248,240,0.5)",
      border: "1px solid rgba(255,248,240,0.1)",
    },
  };

  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {children}
    </button>
  );
}
