// src/admin/components/DashboardCard.jsx
export default function DashboardCard({ label, value, icon, accent = "#D4AF37", trend, sub }) {
  return (
    <div
      className="relative rounded-xl p-5 overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(135deg, #1e0d0d 0%, #2a1010 100%)",
        border: "1px solid rgba(212,175,55,0.15)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Accent glow corner */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between relative">
        <div>
          <div
            style={{
              fontSize: "0.7rem",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              color: "rgba(255,248,240,0.45)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "2rem",
              fontWeight: 700,
              color: "#FFF8F0",
              lineHeight: 1,
              marginBottom: 4,
            }}
          >
            {value}
          </div>
          {sub && (
            <div
              style={{
                fontSize: "0.72rem",
                color: trend === "up" ? "#6ee7b7" : trend === "down" ? "#fca5a5" : "rgba(255,248,240,0.35)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {trend === "up" && "▲ "}
              {trend === "down" && "▼ "}
              {sub}
            </div>
          )}
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: `${accent}18`,
            border: `1px solid ${accent}30`,
            fontSize: "1.2rem",
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
