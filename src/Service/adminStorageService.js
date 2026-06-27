// src/admin/services/adminStorageService.js
// =============================================================
// SINGLE SOURCE OF TRUTH for menu data — used by BOTH the admin
// Menu Manager (MenuPanel.jsx) and the customer Menu page
// (MenuPage.jsx). Backed by localStorage. Every function is
// async so a future API swap needs zero changes at call sites.
// =============================================================

import { initialMenuItems } from "../data/menuData";

const KEYS = {
  MENU: "menu_items",
};

// ── Sync ──────────────────────────────────────────────────────
// Two events are dispatched on every write:
//  - "restaurant-data-change" (this session's requested name)
//  - "restaurantDataUpdated"  (used by other parts of this app
//    built in earlier sessions — kept so nothing already
//    listening for it silently breaks)
// Both fire same-tab only; for cross-tab sync, listen to the
// native "storage" event as well.
function notifyChange() {
  window.dispatchEvent(new Event("restaurant-data-change"));
  window.dispatchEvent(new Event("restaurantDataUpdated"));
}

// ── Init / seed ───────────────────────────────────────────────
function initializeMenuStorage() {
  if (!localStorage.getItem(KEYS.MENU)) {
    localStorage.setItem(KEYS.MENU, JSON.stringify(initialMenuItems));
  }
}

// ── Common read/write ─────────────────────────────────────────
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
  initializeMenuStorage();
  return read(KEYS.MENU);
}

export async function addMenuItem(item) {
  initializeMenuStorage();
  const data = read(KEYS.MENU);
  const newItem = { ...item, id: item.id ?? `menu-${Date.now()}` };
  write(KEYS.MENU, [...data, newItem]);
  return newItem;
}

export async function updateMenuItem(id, patch) {
  initializeMenuStorage();
  const data = read(KEYS.MENU).map((item) =>
    item.id === id ? { ...item, ...patch } : item
  );
  write(KEYS.MENU, data);
  return data.find((item) => item.id === id);
}

export async function deleteMenuItem(id) {
  initializeMenuStorage();
  const data = read(KEYS.MENU).filter((item) => item.id !== id);
  write(KEYS.MENU, data);
  return true;
}

/**
 * Subscribe to menu data changes (same-tab custom events +
 * cross-tab native storage event). Returns an unsubscribe fn.
 */
export function onMenuDataChange(callback) {
  const storageHandler = (e) => {
    if (!e.key || e.key === KEYS.MENU) callback();
  };
  window.addEventListener("restaurant-data-change", callback);
  window.addEventListener("restaurantDataUpdated", callback);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("restaurant-data-change", callback);
    window.removeEventListener("restaurantDataUpdated", callback);
    window.removeEventListener("storage", storageHandler);
  };
}