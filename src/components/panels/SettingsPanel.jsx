// SettingsPanel.jsx — persisted via restaurantStore (single source of truth)
import { useState, useEffect } from "react";
import {
  getSettings as getRestaurantSettings,
  saveSettings as updateRestaurantSettings,
  onDataChange,
} from "../../services/restaurantStore";
import { useAdminAction } from "../../Service/useAdminAction";

export default function SettingsPanel({ showToast }) {
  const [form, setForm] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { run, loading } = useAdminAction(showToast);

  useEffect(() => {
    setForm(getRestaurantSettings());
    setPageLoading(false);
    return onDataChange(() => setForm((prev) => prev ?? getRestaurantSettings()));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    // Support nested keys like "openingHours.weekdays" or "socialLinks.instagram"
    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setForm((f) => ({ ...f, [section]: { ...f[section], [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    await run(() => updateRestaurantSettings(form), "Settings saved successfully");
  }

  if (pageLoading || !form) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  const Field = ({ label, name, type = "text", placeholder }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={
          name.includes(".")
            ? form[name.split(".")[0]]?.[name.split(".")[1]] ?? ""
            : form[name] ?? ""
        }
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Restaurant Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Changes persist across browser refreshes</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Basic Info</h3>
          <Field label="Restaurant Name" name="name" placeholder="Kaara Saaram" />
          <Field label="Tagline" name="tagline" placeholder="Authentic South Indian Cuisine" />
          <Field label="GST Number" name="gstNumber" placeholder="33AABCU9603R1ZX" />
        </section>

        {/* Contact */}
        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Contact</h3>
          <Field label="Phone" name="phone" type="tel" placeholder="+91 98765 43210" />
          <Field label="Email" name="email" type="email" placeholder="hello@kaarasaaram.com" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={form.address ?? ""}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              placeholder="Street, City, State, Pincode"
            />
          </div>
        </section>

        {/* Opening Hours */}
        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Opening Hours</h3>
          <Field label="Weekdays (Mon–Fri)" name="openingHours.weekdays" placeholder="11:00 AM – 10:30 PM" />
          <Field label="Weekends (Sat–Sun)" name="openingHours.weekends" placeholder="10:00 AM – 11:00 PM" />
        </section>

        {/* Social Links */}
        <section className="bg-white border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Social Links</h3>
          <Field label="Instagram" name="socialLinks.instagram" type="url" placeholder="https://instagram.com/..." />
          <Field label="Facebook" name="socialLinks.facebook" type="url" placeholder="https://facebook.com/..." />
          <Field label="Twitter / X" name="socialLinks.twitter" type="url" placeholder="https://twitter.com/..." />
        </section>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          {loading ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
