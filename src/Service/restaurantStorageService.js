// src/services/restaurantStorageService.js
// =============================================================
// SHARED DATA SOURCE — used by BOTH admin panels and customer pages.
// Backed by localStorage today; every function is async so the
// internals can be swapped for real API calls later with zero
// changes required at call sites.
// =============================================================

import {
  defaultRestaurantSettings,
  defaultMenuItems,
  defaultReservations,
  defaultGalleryImages,
  defaultOffers,
} from "../data/menuData";

// ── Storage Keys (same keys as the old admin-only service, so any
//    data already seeded in a user's browser is NOT orphaned) ──
const KEYS = {
  SETTINGS: "restaurant_settings",
  MENU: "menu_items",
  RESERVATIONS: "reservations",
  GALLERY: "gallery_images",
  OFFERS: "offers",
};

// ── Cross-page / cross-tab sync ──────────────────────────────
// Same-tab listeners (e.g. MenuPage and AdminPage open in the same
// tab via client routing) need a custom event, since the native
// `storage` event only fires in OTHER tabs/windows, never the tab
// that made the change. We dispatch both so every consumer — no
// matter where it lives — hears about the update.
const SYNC_EVENT = "restaurantDataUpdated";

function notifyChange() {
  window.dispatchEvent(new Event(SYNC_EVENT));
}

/**
 * Subscribe to data changes (same-tab custom event + cross-tab
 * native storage event). Returns an unsubscribe function.
 *
 * Usage in a page:
 *   useEffect(() => {
 *     const unsubscribe = onRestaurantDataChange(() => {
 *       getMenuItems().then(setItems);
 *     });
 *     return unsubscribe;
 *   }, []);
 */
export function onRestaurantDataChange(callback) {
  const storageHandler = (e) => {
    // Only refetch if it's one of our keys (or unknown — be safe and refetch)
    if (!e.key || Object.values(KEYS).includes(e.key)) callback();
  };
  window.addEventListener(SYNC_EVENT, callback);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(SYNC_EVENT, callback);
    window.removeEventListener("storage", storageHandler);
  };
}

// ── Initialize / seed ─────────────────────────────────────────
export function initializeStorage() {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(defaultRestaurantSettings));
  }
  if (!localStorage.getItem(KEYS.MENU)) {
    localStorage.setItem(KEYS.MENU, JSON.stringify(defaultMenuItems));
  }
  if (!localStorage.getItem(KEYS.RESERVATIONS)) {
    localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(defaultReservations));
  }
  if (!localStorage.getItem(KEYS.GALLERY)) {
    localStorage.setItem(KEYS.GALLERY, JSON.stringify(defaultGalleryImages));
  }
  if (!localStorage.getItem(KEYS.OFFERS)) {
    localStorage.setItem(KEYS.OFFERS, JSON.stringify(defaultOffers));
  }
}

// ── Common read/write helpers ─────────────────────────────────
function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
  notifyChange();
}

// =================================================================
// MENU
// =================================================================

export async function getMenuItems() {
  initializeStorage();
  return read(KEYS.MENU);
}

export async function addMenuItem(item) {
  const data = read(KEYS.MENU);
  const newItem = { ...item, id: item.id ?? Date.now() };
  write(KEYS.MENU, [...data, newItem]);
  return newItem;
}

export async function updateMenuItem(id, patch) {
  const data = read(KEYS.MENU).map((m) => (m.id === id ? { ...m, ...patch } : m));
  write(KEYS.MENU, data);
  return data.find((m) => m.id === id);
}

export async function deleteMenuItem(id) {
  write(KEYS.MENU, read(KEYS.MENU).filter((m) => m.id !== id));
  return true;
}

// =================================================================
// GALLERY
//
// NOTE ON SHAPE: the admin GalleryPanel currently writes
// { url, caption, category: "Food" | "Ambience" | ... } (capitalized).
// The customer GalleryPage expects { src, alt, category: "food" |
// "ambience" | "kitchen" } (lowercase). Rather than silently break
// one side, addGalleryImage() below normalizes a SINGLE stored
// shape that satisfies both: it stores url/caption/category exactly
// as the admin form collects them, AND adds src/alt/category-lowercase
// aliases so GalleryPage's existing `img.src`, `img.alt` lookups keep
// working with zero changes to GalleryPage's JSX.
// =================================================================

function normalizeGalleryItem(raw) {
  const category = (raw.category || "other").toString();
  return {
    ...raw,
    // admin-facing fields (unchanged)
    url: raw.url ?? raw.src,
    caption: raw.caption ?? raw.alt ?? "",
    category, // keep original casing for admin filter pills
    // customer-facing aliases
    src: raw.url ?? raw.src,
    alt: raw.caption ?? raw.alt ?? "",
    categoryLower: category.toLowerCase(),
  };
}

export async function getGalleryImages() {
  initializeStorage();
  return read(KEYS.GALLERY).map(normalizeGalleryItem);
}

export async function addGalleryImage(img) {
  const data = read(KEYS.GALLERY);
  const newItem = normalizeGalleryItem({ ...img, id: img.id ?? Date.now() });
  write(KEYS.GALLERY, [...data, newItem]);
  return newItem;
}

export async function deleteGalleryImage(id) {
  write(KEYS.GALLERY, read(KEYS.GALLERY).filter((g) => g.id !== id));
  return true;
}

// =================================================================
// RESERVATIONS
//
// NOTE ON SHAPE: admin's ReservationsPanel (already working) reads
// r.guestName, r.specialRequests, r.status, r.date, r.time, r.guests,
// r.phone. Customer ReservationPage's form fields are name/requests/
// occasion. createReservation() below maps the customer form shape
// onto the admin-expected shape so NEITHER side needs to change its
// existing field names.
// =================================================================

export async function getReservations() {
  initializeStorage();
  return read(KEYS.RESERVATIONS);
}

export async function createReservation(form) {
  const data = read(KEYS.RESERVATIONS);
  const newItem = {
    id: Date.now(),
    guestName: form.name ?? form.guestName ?? "",
    phone: form.phone ?? "",
    email: form.email ?? "",
    date: form.date ?? "",
    time: form.time ?? "",
    guests: form.guests ?? "",
    occasion: form.occasion ?? "",
    specialRequests: form.requests ?? form.specialRequests ?? "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  write(KEYS.RESERVATIONS, [...data, newItem]);
  return newItem;
}

export async function updateReservationStatus(id, status) {
  const data = read(KEYS.RESERVATIONS).map((r) => (r.id === id ? { ...r, status } : r));
  write(KEYS.RESERVATIONS, data);
  return data.find((r) => r.id === id);
}

export async function deleteReservation(id) {
  write(KEYS.RESERVATIONS, read(KEYS.RESERVATIONS).filter((r) => r.id !== id));
  return true;
}

// =================================================================
// OFFERS
// =================================================================

export async function getOffers() {
  initializeStorage();
  return read(KEYS.OFFERS);
}

export async function addOffer(offer) {
  const data = read(KEYS.OFFERS);
  const newItem = { ...offer, id: offer.id ?? Date.now() };
  write(KEYS.OFFERS, [...data, newItem]);
  return newItem;
}

export async function updateOffer(id, patch) {
  const data = read(KEYS.OFFERS).map((o) => (o.id === id ? { ...o, ...patch } : o));
  write(KEYS.OFFERS, data);
  return data.find((o) => o.id === id);
}

export async function deleteOffer(id) {
  write(KEYS.OFFERS, read(KEYS.OFFERS).filter((o) => o.id !== id));
  return true;
}

// =================================================================
// SETTINGS
// =================================================================

export async function getRestaurantSettings() {
  initializeStorage();
  const stored = localStorage.getItem(KEYS.SETTINGS);
  return stored ? JSON.parse(stored) : defaultRestaurantSettings;
}

export async function updateRestaurantSettings(settings) {
  write(KEYS.SETTINGS, settings);
  return settings;
}