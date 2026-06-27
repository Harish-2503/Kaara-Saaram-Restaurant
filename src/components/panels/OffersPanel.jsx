// OffersPanel.jsx — persisted via restaurantStore (single source of truth)
import { useState, useEffect } from "react";
import { getOffers, addOffer, updateOffer, deleteOffer, onDataChange } from "../../services/restaurantStore";
import { useAdminAction } from "../../Service/useAdminAction";

const MENU_CATEGORIES = ["Breakfast", "Starters", "Main Course", "Breads", "Desserts", "Beverages"];

const emptyForm = {
  title: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  validFrom: "",
  validUntil: "",
  isActive: true,
  applicableCategories: [],
  minOrderValue: "",
};

export default function OffersPanel({ showToast }) {
  const [offers, setOffers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const { run, loading } = useAdminAction(showToast);

  useEffect(() => {
    const load = () => {
      setOffers(getOffers());
      setPageLoading(false);
    };
    load();
    return onDataChange(load);
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === "applicableCategories") {
      setForm((f) => ({
        ...f,
        applicableCategories: checked
          ? [...f.applicableCategories, value]
          : f.applicableCategories.filter((c) => c !== value),
      }));
    } else if (type === "checkbox") {
      setForm((f) => ({ ...f, [name]: checked }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function openAdd() {
    setEditingOffer(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(offer) {
    setEditingOffer(offer);
    setForm({ ...offer });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingOffer(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.discountValue) {
      showToast?.("Title and discount value are required", "error");
      return;
    }
    const payload = { ...form, discountValue: Number(form.discountValue), minOrderValue: Number(form.minOrderValue) };

    if (editingOffer) {
      const updated = await run(() => updateOffer(editingOffer.id, payload), "Offer updated");
      if (updated) setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } else {
      const created = await run(() => addOffer(payload), "Offer created");
      if (created) setOffers((prev) => [...prev, created]);
    }
    closeForm();
  }

  async function toggleActive(offer) {
    const updated = await run(
      () => updateOffer(offer.id, { isActive: !offer.isActive }),
      offer.isActive ? "Offer deactivated" : "Offer activated"
    );
    if (updated) setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this offer?")) return;
    const deleted = await run(() => deleteOffer(id), "Offer deleted");
    if (deleted) setOffers((prev) => prev.filter((o) => o.id !== id));
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Offers & Promotions</h2>
          <p className="text-sm text-gray-500 mt-1">{offers.length} offers · persisted to localStorage</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Offer
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏷️</p>
          <p>No offers yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white border rounded-xl p-5 shadow-sm space-y-3 ${!offer.isActive ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{offer.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{offer.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xl font-bold text-amber-600">
                    {offer.discountType === "percentage" ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                  </p>
                  <p className="text-xs text-gray-400">off</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                {offer.validFrom && <span>📅 {offer.validFrom} → {offer.validUntil}</span>}
                {offer.minOrderValue > 0 && <span>Min. order: ₹{offer.minOrderValue}</span>}
              </div>

              {offer.applicableCategories?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {offer.applicableCategories.map((cat) => (
                    <span key={cat} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      {cat}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => toggleActive(offer)}
                  disabled={loading}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    offer.isActive
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {offer.isActive ? "Active" : "Inactive"}
                </button>
                <button
                  onClick={() => openEdit(offer)}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(offer.id)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {editingOffer ? "Edit Offer" : "Create New Offer"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g. Weekend Brunch Special" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                  placeholder="Short description of the offer" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                  <select name="discountType" value={form.discountType} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value * ({form.discountType === "percentage" ? "%" : "₹"})
                  </label>
                  <input name="discountValue" type="number" min="0" value={form.discountValue} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder={form.discountType === "percentage" ? "20" : "150"} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                  <input name="validFrom" type="date" value={form.validFrom} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input name="validUntil" type="date" value={form.validUntil} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order Value (₹)</label>
                  <input name="minOrderValue" type="number" min="0" value={form.minOrderValue} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Categories</label>
                <div className="flex flex-wrap gap-2">
                  {MENU_CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        name="applicableCategories"
                        value={cat}
                        checked={form.applicableCategories.includes(cat)}
                        onChange={handleChange}
                        className="accent-amber-600"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="accent-amber-600" />
                Active (visible to customers)
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium">
                  {loading ? "Saving…" : editingOffer ? "Update Offer" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
