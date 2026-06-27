// src/components/panels/MenuPanel.jsx — menu management with pagination, search, and image upload
import { useState, useEffect } from "react";
import {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  onDataChange,
} from "../../services/restaurantStore";
import { menuCategories } from "../../data/menuData";
import api from "../../services/api";

const SPICE_LEVELS = ["none", "mild", "medium", "hot", "extra hot"];
const PAGE_SIZE = 12;

const emptyForm = {
  name: "", tamilName: "", category: menuCategories[0],
  description: "", ingredients: "", price: "", offerPrice: "",
  image: "", isVeg: true, spiceLevel: "mild", preparationTime: "",
  availability: true, bestSeller: false, chefRecommended: false,
};

// ── Shared pagination component ────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);
  return (
    <div className="flex items-center justify-center gap-1 pt-2 pb-4">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}
        className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">
        ← Prev
      </button>
      {pages.map((item, idx) =>
        item === "..." ? (
          <span key={`e${idx}`} className="px-2 py-1.5 text-xs text-gray-400">…</span>
        ) : (
          <button key={item} onClick={() => onChange(item)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              page === item ? "bg-amber-600 border-amber-600 text-white" : "border-gray-300 hover:bg-gray-100"
            }`}>
            {item}
          </button>
        )
      )}
      <button onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors">
        Next →
      </button>
    </div>
  );
}

export default function MenuPanel({ showToast }) {
  const [items, setItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  // Image upload in form
  const [imgUploadMode, setImgUploadMode] = useState("url"); // "url" | "file"
  const [imgFile, setImgFile] = useState(null);
  const [imgUploading, setImgUploading] = useState(false);

  useEffect(() => {
    setItems(getMenuItems());
    setPageLoading(false);
    return onDataChange(() => setItems(getMenuItems()));
  }, []);

  // Reset page on filter/search change
  useEffect(() => { setPage(1); }, [filterCat, search]);

  // ── Form helpers ────────────────────────────────────────────
  function openAdd() { setEditingItem(null); setForm(emptyForm); setImgUploadMode("url"); setImgFile(null); setShowForm(true); }
  function openEdit(item) {
    setEditingItem(item);
    setForm({ ...emptyForm, ...item, price: String(item.price ?? ""), offerPrice: item.offerPrice ? String(item.offerPrice) : "", preparationTime: item.preparationTime ? String(item.preparationTime) : "" });
    setImgUploadMode("url");
    setImgFile(null);
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditingItem(null); setForm(emptyForm); setImgFile(null); setImgUploadMode("url"); }
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function resolveImageUrl() {
    if (imgUploadMode === "file" && imgFile) {
      setImgUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", imgFile);
        const res = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
  return `${BASE_URL}${res.data.url}`;
      } catch (err) {
        showToast?.(err.message || "Image upload failed", "error");
        return null;
      } finally {
        setImgUploading(false);
      }
    }
    return form.image || null;
  }

  // ── CRUD ────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { showToast?.("Name and price are required", "error"); return; }
    const imageUrl = await resolveImageUrl();
    if (imgUploadMode === "file" && imgFile && !imageUrl) return; // upload failed

    const payload = { ...form, image: imageUrl || form.image || null, price: Number(form.price) || 0, offerPrice: form.offerPrice ? Number(form.offerPrice) : 0, preparationTime: form.preparationTime ? Number(form.preparationTime) : 0 };
    setSaving(true);
    try {
      if (editingItem) {
        const updated = await updateMenuItem({ ...payload, id: editingItem.id });
        if (updated) { setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i))); showToast?.(`"${updated.name}" updated`); }
      } else {
        const created = await addMenuItem(payload);
        if (created) { setItems((prev) => [...prev, created]); showToast?.(`"${created.name}" added to menu`); }
      }
      closeForm();
    } catch { showToast?.("Something went wrong while saving", "error"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await deleteMenuItem(id); setItems((prev) => prev.filter((i) => i.id !== id)); showToast?.("Menu item deleted"); }
    catch { showToast?.("Failed to delete item", "error"); }
  }

  async function toggleAvailability(item) {
    try {
      const updated = await updateMenuItem({ ...item, availability: !item.availability });
      if (updated) { setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i))); showToast?.(updated.availability ? "Marked available" : "Marked unavailable"); }
    } catch { showToast?.("Failed to update availability", "error"); }
  }

  async function toggleBestSeller(item) {
    try {
      const updated = await updateMenuItem({ ...item, bestSeller: !item.bestSeller });
      if (updated) { setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i))); showToast?.(updated.bestSeller ? "Marked as bestseller" : "Removed bestseller tag"); }
    } catch { showToast?.("Failed to update bestseller status", "error"); }
  }

  // ── Filter + search + paginate ────────────────────────────────
  const filtered = items.filter((i) => {
    if (filterCat !== "All" && i.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return (i.name || "").toLowerCase().includes(q) ||
             (i.tamilName || "").toLowerCase().includes(q) ||
             (i.description || "").toLowerCase().includes(q);
    }
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} of {items.length} items
            {filterCat !== "All" ? ` in ${filterCat}` : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        </div>
        <button onClick={openAdd} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          + Add Item
        </button>
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, Tamil name, or description…"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-xs text-amber-600 hover:text-amber-800 underline self-center">
            Clear
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {["All", ...menuCategories].map((cat) => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterCat === cat ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽️</p>
          <p>{search ? `No items match "${search}".` : "No items in this category yet."}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((item) => (
              <div key={item.id}
                className={`bg-white border rounded-xl p-4 space-y-3 shadow-sm ${!item.availability ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`w-3 h-3 rounded-full shrink-0 ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
                      <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                      {item.bestSeller && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">★ Best</span>}
                      {item.chefRecommended && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">👨‍🍳</span>}
                    </div>
                    {item.tamilName && <p className="text-xs text-gray-400 mt-0.5">{item.tamilName}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{item.category} · {item.spiceLevel} · {item.preparationTime || 0} min</p>
                  </div>
                  <div className="text-right whitespace-nowrap shrink-0">
                    {item.offerPrice > 0 ? (
                      <><p className="text-amber-700 font-bold">₹{item.offerPrice}</p><p className="text-xs text-gray-400 line-through">₹{item.price}</p></>
                    ) : (
                      <p className="text-amber-700 font-bold">₹{item.price}</p>
                    )}
                  </div>
                </div>

                {item.description && <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>}

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button onClick={() => toggleAvailability(item)}
                    className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${item.availability ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {item.availability ? "Available" : "Unavailable"}
                  </button>
                  <button onClick={() => toggleBestSeller(item)}
                    className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${item.bestSeller ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                    {item.bestSeller ? "★ Bestseller" : "Bestseller"}
                  </button>
                  <button onClick={() => openEdit(item)}
                    className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id, item.name)}
                    className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 font-medium ml-auto">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
            <span>Page {page} of {totalPages} · {filtered.length} items</span>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">{editingItem ? "Edit Menu Item" : "Add New Menu Item"}</h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Food Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. Chicken 65" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tamil Name</label>
                  <input name="tamilName" value={form.tamilName} onChange={handleChange}
                    className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="e.g. சிக்கன் 65" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange}
                    className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    {menuCategories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Spice Level</label>
                  <select name="spiceLevel" value={form.spiceLevel} onChange={handleChange}
                    className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    {SPICE_LEVELS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input name="price" type="number" min="0" value={form.price} onChange={handleChange} required
                    className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="0" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price (₹)</label>
                  <input name="offerPrice" type="number" min="0" value={form.offerPrice} onChange={handleChange}
                    className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Leave blank if no offer" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input name="preparationTime" type="number" min="0" value={form.preparationTime} onChange={handleChange}
                    className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. 20" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                    className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="Brief description of the dish" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                  <textarea name="ingredients" value={form.ingredients} onChange={handleChange} rows={2}
                    className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                    placeholder="Comma-separated list of main ingredients" />
                </div>

                {/* Image — URL or file upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-2">
                    {["url", "file"].map((mode) => (
                      <button key={mode} type="button"
                        onClick={() => { setImgUploadMode(mode); setImgFile(null); }}
                        className={`flex-1 text-xs py-1 rounded-md font-medium transition-colors ${
                          imgUploadMode === mode ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                        }`}>
                        {mode === "url" ? "Paste URL" : "Upload File"}
                      </button>
                    ))}
                  </div>
                  {imgUploadMode === "url" ? (
                    <input name="image" value={form.image} onChange={handleChange}
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="https://…" />
                  ) : (
                    <div>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                      <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP or GIF · max 5 MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                {[["isVeg", "Vegetarian", "green"], ["availability", "Available", "amber"], ["bestSeller", "Best Seller", "amber"], ["chefRecommended", "Chef Recommended", "purple"]].map(([name, label, color]) => (
                  <label key={name} className="flex items-center gap-2 text-sm cursor-pointer text-black">
                    <input type="checkbox" name={name} checked={form[name]} onChange={handleChange} className={`accent-${color}-600`} />
                    {label}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving || imgUploading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  {imgUploading ? "Uploading…" : saving ? "Saving…" : editingItem ? "Update Item" : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
