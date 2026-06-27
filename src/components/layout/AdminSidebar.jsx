// src/admin/components/AdminSidebar.jsx
import { useState } from "react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "menu", label: "Menu Manager", icon: "☰" },
  { id: "reservations", label: "Reservations", icon: "◫" },
  { id: "gallery", label: "Gallery", icon: "▦" },
  { id: "offers", label: "Offers", icon: "◈" },
  { id: "settings", label: "Settings", icon: "◎" },
  // Only shown to superadmins — see the `.filter()` below. The backend
  // enforces this independently (POST /auth/register and GET
  // /auth/users both require a superadmin token), so hiding the tab
  // here is a UX nicety, not the actual security boundary.
  { id: "users", label: "Admin Users", icon: "☻", roles: ["superadmin"] },
];

export default function AdminSidebar({ activeTab, onTabChange, currentRole }) {
  const [collapsed, setCollapsed] = useState(false);
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(currentRole));

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        onClick={() => setCollapsed(true)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          flex flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "translate-x-0 w-64"}
        `}
        style={{
          background: "linear-gradient(180deg, #1a0a0a 0%, #2d0f0f 60%, #1a0a0a 100%)",
          borderRight: "1px solid rgba(212,175,55,0.15)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-6"
          style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #8B0000, #D4AF37)",
              fontFamily: "serif",
              fontSize: "1rem",
              color: "#FFF8F0",
            }}
          >
            க
          </div>
          {!collapsed && (
            <div>
              <div
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "#D4AF37",
                  letterSpacing: "0.03em",
                  lineHeight: 1.1,
                }}
              >
                Kaara Saaram
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "rgba(212,175,55,0.5)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginTop: 2,
                }}
              >
                Owner Dashboard
              </div>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setCollapsed(true); // auto-close on mobile
                }}
                className="w-full flex items-center gap-3 px-5 py-3 text-left transition-all duration-200 group relative"
                style={{
                  background: isActive
                    ? "linear-gradient(90deg, rgba(139,0,0,0.4) 0%, rgba(139,0,0,0.1) 100%)"
                    : "transparent",
                  borderLeft: isActive ? "3px solid #D4AF37" : "3px solid transparent",
                }}
              >
                {/* Hover bg */}
                <span
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "rgba(212,175,55,0.04)" }}
                />
                <span
                  style={{
                    fontSize: "1.1rem",
                    color: isActive ? "#D4AF37" : "rgba(255,248,240,0.45)",
                    flexShrink: 0,
                    position: "relative",
                    transition: "color 0.2s",
                  }}
                  className="group-hover:!text-amber-400"
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#FFF8F0" : "rgba(255,248,240,0.5)",
                      letterSpacing: "0.02em",
                      position: "relative",
                      transition: "color 0.2s",
                    }}
                    className="group-hover:!text-[#FFF8F0]"
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className="px-5 py-4"
          style={{ borderTop: "1px solid rgba(212,175,55,0.12)" }}
        >
          {!collapsed && (
            <div
              style={{
                fontSize: "0.65rem",
                color: "rgba(212,175,55,0.3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              v1.0 · Admin Panel
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
          style={{
            background: "#2d0f0f",
            border: "1px solid rgba(212,175,55,0.3)",
            color: "#D4AF37",
            fontSize: "0.6rem",
          }}
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-5 left-5 z-50 md:hidden w-12 h-12 rounded-full flex items-center justify-center shadow-xl"
        style={{
          background: "linear-gradient(135deg, #8B0000, #D4AF37)",
          color: "#FFF8F0",
          fontSize: "1.1rem",
        }}
      >
        ☰
      </button>
    </>
  );
}
