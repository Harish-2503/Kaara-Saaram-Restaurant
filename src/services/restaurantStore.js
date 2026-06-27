// src/services/restaurantStore.js
// ─────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for all runtime data.
// localStorage-backed. Every write dispatches "restaurant-data-change"
// so any tab/component listening via onDataChange() refreshes instantly.
// ─────────────────────────────────────────────────────────────

import {
  initialMenuItems,
  defaultRestaurantSettings,
  defaultReservations,
  defaultGalleryImages,
  defaultOffers,
} from "../data/menuData";
import api from "./api";

// ── Menu field mapping: frontend shape ⇄ backend shape ─────────
// Frontend (MenuPanel/menuData) uses: tamilName, offerPrice, image,
// availability, preparationTime, spiceLevel ("none"|"mild"|"medium"|"hot"|"extra hot").
// Backend (FastAPI MenuItemCreate/Response) uses: tamil_name, offer_price,
// image_url, is_available, prep_time_minutes, spice_level (1-5 int).
// These two helpers translate between them so neither side has to change.
const SPICE_TO_BACKEND = { none: 1, mild: 2, medium: 3, hot: 4, "extra hot": 5 };
const SPICE_FROM_BACKEND = { 1: "none", 2: "mild", 3: "medium", 4: "hot", 5: "extra hot" };

function slugify(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Frontend menu item -> backend MenuItemCreate/Update payload
function toBackendMenuItem(item) {
  const payload = {
    name: item.name,
    tamil_name: item.tamilName || null,
    category: item.category,
    description: item.description || null,
    ingredients: item.ingredients || null,
    price: Number(item.price) || 0,
    offer_price: item.offerPrice ? Number(item.offerPrice) : null,
    spice_level: SPICE_TO_BACKEND[item.spiceLevel] || 1,
    prep_time_minutes: item.preparationTime ? Number(item.preparationTime) : null,
    is_veg: !!item.isVeg,
    is_available: !!item.availability,
    is_chef_recommended: !!item.chefRecommended,
    image_url: item.image || null,
  };
  // Note: the backend has no field for "bestSeller" — it is not sent.
  // It stays as a frontend-only concept until/unless the backend model
  // adds support for it.
  if (item.slug) payload.slug = item.slug;
  return payload;
}

// Backend MenuItemResponse -> the shape MenuPanel/menuData already expect
function fromBackendMenuItem(dto) {
  return {
    id: dto.id,
    slug: dto.slug,
    name: dto.name,
    tamilName: dto.tamil_name || "",
    category: dto.category,
    description: dto.description || "",
    ingredients: dto.ingredients || "",
    price: Number(dto.price),
    offerPrice: dto.offer_price ? Number(dto.offer_price) : 0,
    image: dto.image_url || "",
    isVeg: !!dto.is_veg,
    spiceLevel: SPICE_FROM_BACKEND[dto.spice_level] || "mild",
    preparationTime: dto.prep_time_minutes || 0,
    availability: !!dto.is_available,
    // bestSeller has no backend equivalent yet — defaults to false for
    // items that come from the API. Existing localStorage items keep
    // whatever value they already had until they're re-saved.
    bestSeller: false,
    chefRecommended: !!dto.is_chef_recommended,
  };
}

// ── Reservation field mapping: frontend shape ⇄ backend shape ──
// Frontend forms use two slightly different shapes that both flow into
// addReservation(form):
//   - ReservationPage.jsx (customer): name, phone, email, date,
//     time ("7:30 PM" 12-hour string from a <select>), guests
//     (string, can be "9+"), occasion, requests
//   - ReservationsPanel.jsx (admin):  guestName, phone, email, date,
//     time ("19:30" 24-hour string from <input type="time">), guests
//     (number from <input type="number">), specialRequests
// Backend (FastAPI ReservationCreate) uses: customer_name, customer_phone,
// customer_email, reservation_date, reservation_time ("HH:MM:SS" 24-hour),
// party_size (int 1-50), special_requests.
// There is no backend field for "occasion" — it is accepted on the
// frontend form but not sent to the backend (same kind of gap as
// MenuItem's bestSeller).

// Converts "7:30 PM" or "19:30" or "19:30:00" -> "HH:MM:SS" (24-hour).
function to24HourTime(value) {
  const raw = String(value || "").trim();
  if (!raw) return "00:00:00";

  // Already 24-hour "HH:MM" or "HH:MM:SS" (from <input type="time">)
  const plain24 = raw.match(/^([01]?\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/);
  if (plain24 && !/[AP]M/i.test(raw)) {
    const [, h, m, s] = plain24;
    return `${h.padStart(2, "0")}:${m}:${s || "00"}`;
  }

  // 12-hour "7:30 PM" / "07:30 PM" (from the customer-facing <select>)
  const twelveHour = raw.match(/^(\d{1,2}):([0-5]\d)\s*([AP]M)$/i);
  if (twelveHour) {
    let [, h, m, period] = twelveHour;
    h = parseInt(h, 10);
    if (period.toUpperCase() === "PM" && h !== 12) h += 12;
    if (period.toUpperCase() === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m}:00`;
  }

  // Fallback — couldn't parse, send midnight rather than an invalid string
  // that the backend's Pydantic `time` field would 422 on.
  return "00:00:00";
}

// Converts "HH:MM:SS" (24-hour, from the backend) -> "7:30 PM" (12-hour),
// matching the display format both panels already use.
function to12HourTime(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${period}`;
}

// Converts the frontend's "guests" value (number, numeric string, or the
// special "9+" sentinel used by ReservationPage's <select>) into an int
// the backend's party_size: int (1-50) will accept. "9+" becomes 9 — the
// largest size the dropdown offers below the "call us" cutoff.
function toPartySize(guests) {
  if (guests === "9+") return 9;
  const n = parseInt(guests, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, 50);
}

// Frontend reservation form -> backend ReservationCreate payload.
// Accepts both ReservationPage's and ReservationsPanel's slightly
// different field names (name/guestName, requests/specialRequests).
function toBackendReservation(form) {
  return {
    customer_name: form.guestName || form.name || "",
    customer_email: form.email || null,
    customer_phone: form.phone || "",
    reservation_date: form.date || "",
    reservation_time: to24HourTime(form.time),
    party_size: toPartySize(form.guests),
    special_requests: form.specialRequests || form.requests || null,
  };
}

// Backend ReservationResponse -> the shape both panels already expect
// (guestName, phone, email, date, time as a 12-hour string, guests,
// specialRequests, status, createdAt). "occasion" has no backend
// equivalent and is not present on records that came from the API.
function fromBackendReservation(dto) {
  return {
    id: dto.id,
    guestName: dto.customer_name,
    phone: dto.customer_phone,
    email: dto.customer_email || "",
    date: dto.reservation_date,
    time: to12HourTime(dto.reservation_time),
    guests: dto.party_size,
    specialRequests: dto.special_requests || "",
    status: dto.status,
    createdAt: dto.created_at,
  };
}

const K = {
  MENU:         "menu_items",
  RESERVATIONS: "reservations",
  GALLERY:      "gallery_images",
  OFFERS:       "offers",
  SETTINGS:     "restaurant_settings",
};

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}
function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event("restaurant-data-change"));
}

export function initStore() {
  if (!read(K.MENU))         write(K.MENU,         initialMenuItems);
  if (!read(K.RESERVATIONS)) write(K.RESERVATIONS, defaultReservations);
  if (!read(K.GALLERY))      write(K.GALLERY,      defaultGalleryImages);
  if (!read(K.OFFERS))       write(K.OFFERS,       defaultOffers);
  if (!read(K.SETTINGS))     write(K.SETTINGS,     defaultRestaurantSettings);

  // Menu and Reservations now live in MySQL via the FastAPI backend.
  // Fire-and-forget a refresh of each local cache so every existing
  // synchronous call site (getMenuItems/getReservations and everywhere
  // they're used) keeps working unchanged, but now shows real backend
  // data as soon as it arrives. Failures (backend not running yet, etc.)
  // are swallowed here — callers already handle an empty/seed list
  // gracefully.
  refreshMenuCache().catch(() => {});
  refreshReservationsCache().catch(() => {});
}

// Pulls the current menu list from the backend and overwrites the local
// cache + fires the existing "restaurant-data-change" event, so every
// component already listening via onDataChange() re-renders with fresh
// data exactly like it does for a localStorage write today.
async function refreshMenuCache() {
  const response = await api.get("/menu", { params: { page: 1, page_size: 100 } });
  const items = (response.data.items || []).map(fromBackendMenuItem);
  write(K.MENU, items);
  return items;
}

// Same pattern as refreshMenuCache(), for reservations. GET /reservations
// requires an admin token (see app/routes/reservation.py) — when no
// admin is logged in (e.g. a customer just browsing the public site),
// the request 401s and is swallowed by the .catch(() => {}) at the
// call sites below, leaving the existing local cache in place.
async function refreshReservationsCache() {
  const response = await api.get("/reservations");
  const items = (response.data || []).map(fromBackendReservation);
  write(K.RESERVATIONS, items);
  return items;
}

export function onDataChange(callback) {
  const crossTab = (e) => {
    if (!e.key || Object.values(K).includes(e.key)) callback();
  };
  window.addEventListener("restaurant-data-change", callback);
  window.addEventListener("storage", crossTab);
  return () => {
    window.removeEventListener("restaurant-data-change", callback);
    window.removeEventListener("storage", crossTab);
  };
}

// MENU — now backed by the FastAPI /menu endpoints (MySQL) instead of
// localStorage directly. getMenuItems() stays synchronous and reads the
// local cache (kept fresh by refreshMenuCache(), called from initStore()
// and after every mutation below) so every existing call site that
// expects an array back, not a Promise, keeps working unchanged.
export function getMenuItems() { return read(K.MENU) || []; }
export function saveMenuItems(items) { write(K.MENU, items); }

export async function addMenuItem(item) {
  const response = await api.post("/menu", toBackendMenuItem({ ...item, slug: item.slug || slugify(item.name) }));
  const created = fromBackendMenuItem(response.data);
  await refreshMenuCache();
  return created;
}

export async function updateMenuItem(updated) {
  const response = await api.put(`/menu/${updated.id}`, toBackendMenuItem(updated));
  const saved = fromBackendMenuItem(response.data);
  await refreshMenuCache();
  return saved;
}

export async function deleteMenuItem(id) {
  await api.delete(`/menu/${id}`);
  await refreshMenuCache();
  return true;
}

export function getSignatureItems() {
  return getMenuItems().filter((m) => m.bestSeller && m.chefRecommended);
}

// RESERVATIONS — now backed by the FastAPI /reservations endpoints
// (MySQL) instead of localStorage directly. getReservations() stays
// synchronous and reads the local cache (kept fresh by
// refreshReservationsCache(), called from initStore() and after every
// mutation below) so every existing call site that expects an array
// back, not a Promise, keeps working unchanged.
export function getReservations() { return read(K.RESERVATIONS) || []; }

export async function addReservation(form) {
  const response = await api.post("/reservations", toBackendReservation(form));
  const created = fromBackendReservation(response.data);
  // The public booking endpoint doesn't require login, so this refresh
  // is best-effort — a customer with no admin token will get a 401 from
  // GET /reservations, which is fine: their newly created reservation
  // already came back directly in `created` above for confirmation.
  await refreshReservationsCache().catch(() => {});
  return created;
}

export async function updateReservationStatus(id, status) {
  const response = await api.put(`/reservations/${id}/status`, { status });
  const updated = fromBackendReservation(response.data);
  await refreshReservationsCache();
  return updated;
}

export async function deleteReservation(id) {
  await api.delete(`/reservations/${id}`);
  await refreshReservationsCache();
  return true;
}

// GALLERY
export function getGalleryItems() {
  return (read(K.GALLERY) || []).map((item) => ({
    ...item,
    src:           item.src     || item.url     || "",
    url:           item.url     || item.src     || "",
    alt:           item.alt     || item.caption || "",
    caption:       item.caption || item.alt     || "",
    categoryLower: (item.category || "other").toLowerCase(),
  }));
}
export function addGalleryItem(item) {
  const newItem = { ...item, id: item.id || `gal-${Date.now()}`, uploadedAt: new Date().toISOString() };
  write(K.GALLERY, [...(read(K.GALLERY) || []), newItem]);
  return newItem;
}
export function deleteGalleryItem(id) {
  const before = read(K.GALLERY) || [];
  const next = before.filter((g) => g.id !== id);
  write(K.GALLERY, next);
  return next.length !== before.length;
}

// OFFERS
export function getOffers() { return read(K.OFFERS) || []; }
export function addOffer(offer) {
  const newOffer = { ...offer, id: offer.id || `offer-${Date.now()}` };
  write(K.OFFERS, [...getOffers(), newOffer]);
  return newOffer;
}
export function updateOffer(idOrUpdated, maybePatch) {
  const id = typeof idOrUpdated === "object" ? idOrUpdated.id : idOrUpdated;
  const patch = typeof idOrUpdated === "object" ? idOrUpdated : maybePatch;
  let result = null;
  const next = getOffers().map((o) => {
    if (o.id !== id) return o;
    result = { ...o, ...patch, id: o.id };
    return result;
  });
  write(K.OFFERS, next);
  return result;
}
export function deleteOffer(id) {
  const before = getOffers();
  const next = before.filter((o) => o.id !== id);
  write(K.OFFERS, next);
  return next.length !== before.length;
}

// SETTINGS
export function getSettings() { return read(K.SETTINGS) || defaultRestaurantSettings; }
export function saveSettings(settings) {
  write(K.SETTINGS, settings);
  return settings;
}

// USERS — admin/staff accounts. Unlike Menu/Reservations, this is not
// cached in localStorage: there's no public/customer-facing view of
// users, no offline concern, and the data is sensitive enough that we
// don't want a stale copy sitting in localStorage longer than needed.
// Both functions call the backend directly and return a Promise.
//
// POST /auth/register and GET /auth/users are superadmin-only on the
// backend (with one exception: registration is open when the `users`
// table is completely empty, so the very first superadmin can be
// created on a brand-new database). A non-superadmin calling either of
// these will get a 403 from the backend, surfaced via api.js's error
// handling as a normal rejected Promise.
export async function getUsers() {
  const response = await api.get("/auth/users");
  return response.data;
}

export async function addUser(form) {
  const response = await api.post("/auth/register", {
    username: form.username,
    email: form.email,
    password: form.password,
    full_name: form.fullName || form.full_name || null,
    role: form.role || "staff",
  });
  return response.data;
}

export async function updateUser(id, form) {
  const payload = {};
  if (form.full_name !== undefined) payload.full_name = form.full_name || null;
  if (form.email !== undefined) payload.email = form.email;
  if (form.role !== undefined) payload.role = form.role;
  if (form.is_active !== undefined) payload.is_active = form.is_active;
  if (form.password) payload.password = form.password;
  const response = await api.put(`/auth/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id) {
  await api.delete(`/auth/users/${id}`);
}
