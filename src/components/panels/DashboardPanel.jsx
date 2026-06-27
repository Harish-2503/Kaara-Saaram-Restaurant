// src/admin/components/panels/DashboardPanel.jsx
import DashboardCard from "../ui/DashboardCard";
import StatusBadge from "../ui/StatusBadge";

export default function DashboardPanel({ menuItems, reservations, gallery, offers }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRes = reservations.filter((r) => r.date === todayStr);
  const activeOffers = offers.filter((o) => o.isActive);
  const bestSellers = menuItems.filter((m) => m.bestSeller);
  const recentRes = [...reservations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const sectionTitle = (t) => (
    <h3
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "1rem",
        fontWeight: 600,
        color: "#D4AF37",
        marginBottom: 14,
        letterSpacing: "0.02em",
      }}
    >
      {t}
    </h3>
  );

  const tableHead = (cols) => (
    <thead>
      <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
        {cols.map((c) => (
          <th
            key={c}
            style={{
              textAlign: "left",
              padding: "6px 12px",
              fontSize: "0.65rem",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "rgba(212,175,55,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );

  const rowStyle = {
    borderBottom: "1px solid rgba(255,248,240,0.04)",
  };
  const tdStyle = {
    padding: "9px 12px",
    fontSize: "0.8rem",
    fontFamily: "'Inter', sans-serif",
    color: "rgba(255,248,240,0.75)",
    verticalAlign: "middle",
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          label="Menu Items"
          value={menuItems.length}
          icon="☰"
          accent="#D4AF37"
          sub={`${menuItems.filter((m) => m.availability).length} available`}
        />
        <DashboardCard
          label="Today's Reservations"
          value={todayRes.length}
          icon="◫"
          accent="#8B0000"
          sub={`${todayRes.filter((r) => r.status === "pending").length} pending`}
          trend={todayRes.length > 0 ? "up" : null}
        />
        <DashboardCard
          label="Gallery Images"
          value={gallery.length}
          icon="▦"
          accent="#b5651d"
          sub="across 4 categories"
        />
        <DashboardCard
          label="Active Offers"
          value={activeOffers.length}
          icon="◈"
          accent="#6ee7b7"
          sub={`${offers.length} total created`}
          trend={activeOffers.length > 0 ? "up" : null}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reservations */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #1e0d0d, #2a1010)",
            border: "1px solid rgba(212,175,55,0.12)",
          }}
        >
          <div className="px-5 pt-5 pb-3">{sectionTitle("Recent Reservations")}</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              {tableHead(["Name", "Date", "Guests", "Status"])}
              <tbody>
                {recentRes.map((r) => (
                  <tr key={r.id} style={rowStyle} className="hover:bg-white/[0.02] transition-colors">
                    <td style={tdStyle}>
                      <div style={{ color: "#FFF8F0", fontWeight: 500 }}>{r.guestName}</div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,248,240,0.35)", marginTop: 1 }}>
                        {r.phone}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <div>{r.date}</div>
                      <div style={{ fontSize: "0.7rem", color: "rgba(255,248,240,0.35)" }}>{r.time}</div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{r.guests}</td>
                    <td style={tdStyle}>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentRes.length === 0 && (
            <div className="py-8 text-center" style={{ color: "rgba(255,248,240,0.25)", fontSize: "0.8rem" }}>
              No reservations yet
            </div>
          )}
        </div>

        {/* Popular Dishes */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #1e0d0d, #2a1010)",
            border: "1px solid rgba(212,175,55,0.12)",
          }}
        >
          <div className="px-5 pt-5 pb-3">{sectionTitle("Best Sellers & Specials")}</div>
          <div className="px-5 pb-5 space-y-3">
            {bestSellers.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: "rgba(255,248,240,0.03)",
                  border: "1px solid rgba(212,175,55,0.07)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      item.isVeg
                        ? "rgba(134,239,172,0.12)"
                        : "rgba(252,165,165,0.12)",
                    fontSize: "1rem",
                  }}
                >
                  {item.isVeg ? "🌿" : "🍗"}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#FFF8F0",
                      fontFamily: "'Inter', sans-serif",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "rgba(255,248,240,0.35)", fontFamily: "'Inter', sans-serif" }}>
                    {item.category}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.todaySpecial && (
                    <span
                      style={{
                        fontSize: "0.62rem",
                        padding: "2px 7px",
                        borderRadius: 4,
                        background: "rgba(212,175,55,0.12)",
                        color: "#D4AF37",
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                      }}
                    >
                      TODAY
                    </span>
                  )}
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#D4AF37", fontFamily: "'Inter', sans-serif" }}>
                    ₹{item.price}
                  </div>
                </div>
              </div>
            ))}
            {bestSellers.length === 0 && (
              <div className="py-6 text-center" style={{ color: "rgba(255,248,240,0.25)", fontSize: "0.8rem" }}>
                No best sellers marked yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
