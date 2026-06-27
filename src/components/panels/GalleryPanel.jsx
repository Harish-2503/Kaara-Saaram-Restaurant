// GalleryPanel.jsx — backed by FastAPI /gallery and /upload endpoints
import { useState, useEffect } from "react";
import {
  getGalleryItems as getGalleryImages,
  addGalleryItem as addGalleryImage,
  deleteGalleryItem as deleteGalleryImage,
  onDataChange,
} from "../../services/restaurantStore";
import { useAdminAction } from "../../Service/useAdminAction";
import api from "../../services/api";

const GALLERY_CATEGORIES = ["Food", "Ambience", "Events", "Team", "Other"];
const PAGE_SIZE = 12;
const emptyForm = { url: "", caption: "", category: "Food" };

// ── Reusable pagination bar ────────────────────────────────────
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
    <div className="flex items-center justify-center gap-1 pt-4">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
      >
        ← Prev
      </button>
      {pages.map((item, idx) =>
        item === "..." ? (
          <span key={`e${idx}`} className="px-2 py-1.5 text-xs text-gray-400">…</span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              page === item
                ? "bg-amber-600 border-amber-600 text-white"
                : "border-gray-300 hover:bg-gray-100"
            }`}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
      >
        Next →
      </button>
    </div>
  );
}

export default function GalleryPanel({ showToast }) {
  const [images, setImages] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [filterCat, setFilterCat] = useState("All");
  const [uploadMode, setUploadMode] = useState("url"); // "url" | "file"
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const { run, loading } = useAdminAction(showToast);

  useEffect(() => {
    const load = () => {
      setImages(getGalleryImages());
      setPageLoading(false);
    };
    load();
    return onDataChange(load);
  }, []);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [filterCat]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file);
    setUploadPreview(URL.createObjectURL(file));
  }

  async function uploadFileToServer() {
    if (!uploadFile) return null;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      const response = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.url;
    } catch (err) {
      showToast?.(err.message || "Upload failed", "error");
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    let imageUrl = form.url.trim();
    if (uploadMode === "file") {
      if (!uploadFile) { showToast?.("Please select a file to upload", "error"); return; }
      imageUrl = await uploadFileToServer();
      if (!imageUrl) return;
    } else {
      if (!imageUrl) { showToast?.("Image URL is required", "error"); return; }
    }
    const created = await run(
      () => addGalleryImage({ ...form, url: imageUrl }),
      "Image added to gallery"
    );
    if (created) {
      setImages((prev) => [...prev, created]);
      closeForm();
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Remove this image from gallery?")) return;
    const deleted = await run(() => deleteGalleryImage(id), "Image removed");
    if (deleted) setImages((prev) => prev.filter((img) => img.id !== id));
  }

  function closeForm() {
    setShowForm(false);
    setForm(emptyForm);
    setUploadFile(null);
    setUploadPreview("");
    setUploadMode("url");
  }

  const filtered = filterCat === "All" ? images : images.filter((img) => img.category === filterCat);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const preview = uploadMode === "file" ? uploadPreview : form.url;

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
          <h2 className="text-2xl font-bold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} image{filtered.length !== 1 ? "s" : ""}
            {filterCat !== "All" ? ` in ${filterCat}` : ""} · synced with backend
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Image
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {["All", ...GALLERY_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterCat === cat ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🖼️</p>
          <p>No images in this category yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map((img) => (
              <div key={img.id} className="group relative bg-gray-100 rounded-xl overflow-hidden aspect-square shadow-sm">
                <img
                  src={img.url}
                  alt={img.caption}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=No+Image"; }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <p className="text-white text-xs font-medium text-center px-2">{img.caption || img.category}</p>
                  <button
                    onClick={() => handleDelete(img.id)}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
                  >
                    Remove
                  </button>
                </div>
                <span className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                  {img.category}
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Page {page} of {totalPages} · {filtered.length} images</span>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      {/* Add Image Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Add Gallery Image</h3>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">

              {/* Upload mode toggle */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {["url", "file"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => { setUploadMode(mode); setUploadFile(null); setUploadPreview(""); }}
                    className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
                      uploadMode === mode ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {mode === "url" ? "Paste URL" : "Upload File"}
                  </button>
                ))}
              </div>

              {uploadMode === "url" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                  <input
                    name="url" value={form.url} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://images.unsplash.com/…"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image File *</label>
                  <input
                    type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP or GIF · max 5 MB</p>
                </div>
              )}

              {preview && (
                <div className="rounded-lg overflow-hidden h-40 bg-gray-100">
                  <img
                    src={preview} alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Invalid+URL"; }}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <input
                  name="caption" value={form.caption} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Describe the image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category" value={form.category} onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={loading || uploading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium">
                  {uploading ? "Uploading…" : loading ? "Adding…" : "Add Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
