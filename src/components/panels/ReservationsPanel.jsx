// ReservationsPanel.jsx — persisted via restaurantStore (single source of truth)
import { useState, useEffect } from "react";
import {
  getReservations,
  addReservation,
  updateReservationStatus,
  deleteReservation,
  onDataChange,
} from "../../services/restaurantStore";
import { useAdminAction } from "../../Service/useAdminAction";

const STATUS_COLORS = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

const emptyForm = {
  guestName: "",
  phone: "",
  email: "",
  date: "",
  time: "",
  guests: 2,
  specialRequests: "",
  status: "pending",
};

export default function ReservationsPanel({ showToast }) {
  const [reservations, setReservations] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState("all");
  const { run, loading } = useAdminAction(showToast);

  function loadReservations() {
    setReservations([...getReservations()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    setPageLoading(false);
  }

  useEffect(() => {
    loadReservations();
    return onDataChange(loadReservations);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.guestName.trim() || !form.date || !form.time) {
      showToast?.("Name, date and time are required", "error");
      return;
    }
    const created = await run(() => addReservation(form), "Reservation added");
    if (created) {
      setReservations((prev) => [created, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
    }
  }

  async function handleStatusChange(id, status) {
    const updated = await run(
      () => updateReservationStatus(id, status),
      `Marked as ${status}`
    );
    if (updated) setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this reservation?")) return;
    const deleted = await run(() => deleteReservation(id), "Reservation deleted");
    if (deleted) setReservations((prev) => prev.filter((r) => r.id !== id));
  }

  const filtered =
    filterStatus === "all" ? reservations : reservations.filter((r) => r.status === filterStatus);

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reservations</h2>
          <p className="text-sm text-gray-500 mt-1">{reservations.length} total · persisted to localStorage</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Reservation
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filterStatus === s
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s === "all"
              ? `All (${reservations.length})`
              : `${s} (${reservations.filter((r) => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Reservation cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📅</p>
          <p>No reservations found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((res) => (
            <div key={res.id} className="bg-white border rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{res.guestName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[res.status]}`}>
                      {res.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                    <span>📞 {res.phone}</span>
                    <span>📅 {res.date} · {res.time}</span>
                    <span>👥 {res.guests} guests</span>
                  </div>
                  {res.specialRequests && (
                    <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      💬 {res.specialRequests}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  {res.status === "pending" && (
                    <button
                      onClick={() => handleStatusChange(res.id, "confirmed")}
                      disabled={loading}
                      className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                    >
                      Confirm
                    </button>
                  )}
                  {res.status === "confirmed" && (
                    <button
                      onClick={() => handleStatusChange(res.id, "completed")}
                      disabled={loading}
                      className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                    >
                      Complete
                    </button>
                  )}
                  {res.status !== "cancelled" && res.status !== "completed" && (
                    <button
                      onClick={() => handleStatusChange(res.id, "cancelled")}
                      disabled={loading}
                      className="text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(res.id)}
                    disabled={loading}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reservation Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">New Reservation</h3>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name *</label>
                  <input name="guestName" value={form.guestName} onChange={handleChange} required
                    className="w-full text-black border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    className="w-full text-black border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    className="w-full text-black border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input name="date" type="date" value={form.date} onChange={handleChange} required
                    className="w-full text-black border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input name="time" type="time" value={form.time} onChange={handleChange} required
                    className="w-full text-black border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. of Guests</label>
                  <input name="guests" type="number" min="1" max="20" value={form.guests} onChange={handleChange}
                    className="w-full text-black border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" value={form.status} onChange={handleChange}
                    className="w-full text-black border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <textarea name="specialRequests" value={form.specialRequests} onChange={handleChange} rows={2}
                    className="w-full text-black border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="Dietary needs, seating preferences…" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium">
                  {loading ? "Adding…" : "Add Reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
