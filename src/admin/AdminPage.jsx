// src/admin/AdminPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import AdminSidebar from "../components/layout/AdminSidebar";
import DashboardPanel from "../components/panels/DashboardPanel";
import SettingsPanel from "../components/panels/SettingsPanel";
import MenuPanel from "../components/panels/MenuPanel";
import ReservationsPanel from "../components/panels/ReservationsPanel";
import GalleryPanel from "../components/panels/GalleryPanel";
import OffersPanel from "../components/panels/OffersPanel";
import UsersPanel from "../components/panels/UsersPanel";
import { logout, getCurrentAdmin } from "./auth/authService";
import {
  initStore,
  onDataChange,
  getMenuItems,
  getReservations,
  getGalleryItems,
  getOffers,
  getSettings,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateReservationStatus,
  deleteReservation,
  addGalleryItem,
  deleteGalleryItem,
  addOffer,
  updateOffer,
  deleteOffer,
  saveSettings,
} from "../services/restaurantStore";

const PANEL_META = {
  dashboard:    { title: "Dashboard",           sub: "Overview of your restaurant" },
  menu:         { title: "Menu Manager",        sub: "Add, edit, and manage your food items" },
  reservations: { title: "Reservations",        sub: "Track and manage table bookings" },
  gallery:      { title: "Gallery Manager",     sub: "Upload and organise restaurant photos" },
  offers:       { title: "Offer Manager",       sub: "Create discount and festival offers" },
  settings:     { title: "Restaurant Settings", sub: "Update your restaurant profile and contact info" },
  users:        { title: "Admin Users",         sub: "Create and view admin/staff accounts" },
};

function Toast({ message, visible }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[100] transition-all duration-300"
      style={{ transform: visible ? "translateY(0)" : "translateY(20px)", opacity: visible ? 1 : 0, pointerEvents: "none" }}
    >
      <div style={{ background: "linear-gradient(135deg, #1e0d0d, #2a1010)", border: "1px solid rgba(110,231,183,0.3)", borderRadius: 10, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
        <span style={{ fontSize: "0.9rem" }}>✓</span>
        <span style={{ fontSize: "0.82rem", fontFamily: "'Inter', sans-serif", color: "#6ee7b7" }}>{message}</span>
      </div>
    </div>
  );
}

function loadAll() {
  return {
    menuItems:    getMenuItems(),
    reservations: getReservations(),
    gallery:      getGalleryItems(),
    offers:       getOffers(),
    settings:     getSettings(),
  };
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState(() => { initStore(); return loadAll(); });
  const [toast, setToast] = useState({ message: "", visible: false });
  const currentAdmin = getCurrentAdmin();

  useEffect(() => {
    const unsub = onDataChange(() => setData(loadAll()));
    return unsub;
  }, []);

  const showToast = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2800);
  };

  const handleLogout = () => {
    // Clears admin_token / admin_user only — restaurant data
    // (menu/reservations/gallery/offers/settings) is untouched.
    logout();
    navigate("/admin/login", { replace: true });
  };

  // Menu handlers — addMenuItem/updateMenuItem/deleteMenuItem are now
  // async (they call the FastAPI backend). These handlers are currently
  // unreachable from the UI (MenuPanel manages menu CRUD internally and
  // does not call props.onAdd/onEdit/onDelete), but are kept working and
  // safe — .catch() prevents an unhandled promise rejection if the
  // backend call fails.
  const handleAddMenu = (item) => { addMenuItem(item).then(() => showToast(`"${item.name}" added to menu`)).catch((err) => showToast(err.message || "Failed to add item")); };
  const handleEditMenu = (item) => { updateMenuItem(item).then(() => showToast(`"${item.name}" updated`)).catch((err) => showToast(err.message || "Failed to update item")); };
  const handleDeleteMenu = (id) => { deleteMenuItem(id).then(() => showToast("Menu item deleted")).catch((err) => showToast(err.message || "Failed to delete item")); };

  // Reservation handlers — updateReservationStatus/deleteReservation are
  // now async (they call the FastAPI backend). These handlers are
  // currently unreachable from the UI (ReservationsPanel manages
  // reservation CRUD internally and does not call
  // props.onStatusChange/onDelete), but are kept working and safe —
  // .catch() prevents an unhandled promise rejection if the backend
  // call fails.
  const handleReservationStatus = (id, status) => {
    const labels = { confirmed: "Reservation accepted", rejected: "Reservation rejected", completed: "Marked as completed", pending: "Restored to pending" };
    updateReservationStatus(id, status)
      .then(() => showToast(labels[status] || "Status updated"))
      .catch((err) => showToast(err.message || "Failed to update status"));
  };
  const handleDeleteReservation = (id) => { deleteReservation(id).then(() => showToast("Reservation deleted")).catch((err) => showToast(err.message || "Failed to delete reservation")); };

  // Gallery handlers
  const handleAddGallery = (item) => { addGalleryItem(item); showToast("Image uploaded to gallery"); };
  const handleDeleteGallery = (id) => { deleteGalleryItem(id); showToast("Image removed from gallery"); };

  // Offer handlers
  const handleAddOffer = (offer) => { addOffer(offer); showToast(`"${offer.title}" offer created`); };
  const handleEditOffer = (offer) => { updateOffer(offer); showToast(`"${offer.title}" updated`); };
  const handleDeleteOffer = (id) => { deleteOffer(id); showToast("Offer deleted"); };
  const handleToggleOffer = (id) => {
    const offer = data.offers.find((o) => o.id === id);
    if (offer) updateOffer({ ...offer, active: !offer.active });
    showToast("Offer status toggled");
  };

  // Settings handler
  const handleSaveSettings = (settings) => { saveSettings(settings); showToast("Settings saved successfully"); };

  const renderPanel = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPanel menuItems={data.menuItems} reservations={data.reservations} gallery={data.gallery} offers={data.offers} />;
      case "menu":
        return <MenuPanel menuItems={data.menuItems} onAdd={handleAddMenu} onEdit={handleEditMenu} onDelete={handleDeleteMenu} showToast={showToast} />;
      case "reservations":
        return <ReservationsPanel reservations={data.reservations} onStatusChange={handleReservationStatus} onDelete={handleDeleteReservation} />;
      case "gallery":
        return <GalleryPanel gallery={data.gallery} onAdd={handleAddGallery} onDelete={handleDeleteGallery} />;
      case "offers":
        return <OffersPanel offers={data.offers} onAdd={handleAddOffer} onEdit={handleEditOffer} onDelete={handleDeleteOffer} onToggle={handleToggleOffer} />;
      case "settings":
        return <SettingsPanel settings={data.settings} onSave={handleSaveSettings} />;
      case "users":
        return <UsersPanel showToast={showToast} />;
      default:
        return null;
    }
  };

  const meta = PANEL_META[activeTab];
  const pendingCount = data.reservations.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen flex" style={{ background: "#120606", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} currentRole={currentAdmin?.role} />
      <main className="flex-1 md:ml-64 transition-all duration-300 min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4" style={{ background: "rgba(18,6,6,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.2rem", fontWeight: 700, color: "#FFF8F0", lineHeight: 1.1 }}>{meta.title}</h1>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,248,240,0.35)", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{meta.sub}</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <button onClick={() => setActiveTab("reservations")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:opacity-80" style={{ background: "rgba(139,0,0,0.2)", border: "1px solid rgba(139,0,0,0.4)" }}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ background: "#8B0000", fontSize: "0.55rem", fontWeight: 700 }}>{pendingCount}</span>
                <span style={{ fontSize: "0.72rem", color: "#fca5a5", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>pending</span>
              </button>
            )}
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #8B0000, #D4AF37)", fontFamily: "serif", fontSize: "0.85rem", color: "#FFF8F0", fontWeight: 700 }}>க</div>
            <button
              onClick={handleLogout}
              title={currentAdmin ? `Logout (${currentAdmin.username})` : "Logout"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: "rgba(255,248,240,0.05)", border: "1px solid rgba(212,175,55,0.15)" }}
            >
              <LogOut size={13} style={{ color: "rgba(255,248,240,0.6)" }} />
              <span style={{ fontSize: "0.72rem", color: "rgba(255,248,240,0.6)", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>Logout</span>
            </button>
          </div>
        </header>
        <div className="flex-1 p-6">{renderPanel()}</div>
        <footer className="px-6 py-3 text-center" style={{ borderTop: "1px solid rgba(212,175,55,0.07)" }}>
          <span style={{ fontSize: "0.65rem", color: "rgba(255,248,240,0.2)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.05em" }}>
            Kaara Saaram Admin Panel · v1.0 · localStorage Mode
          </span>
        </footer>
      </main>
      <Toast message={toast.message} visible={toast.visible} />
      <style>{`
        * { box-sizing: border-box; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7) sepia(1) saturate(2) hue-rotate(5deg); cursor: pointer; }
        .admin-scroll::-webkit-scrollbar { width: 4px; }
        .admin-scroll::-webkit-scrollbar-track { background: transparent; }
        .admin-scroll::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 2px; }
        option { background: #1e0d0d; color: #FFF8F0; }
      `}</style>
    </div>
  );
}
