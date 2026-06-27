// src/Service/menuService.js
// =============================================================
// PUBLIC API for all menu reads on customer-facing pages.
// Both getMenuItems() and getSignatureItems() read from the same
// localStorage key ("menu_items") that adminStorageService writes.
// onMenuDataChange() listens to ALL three sync events so it hears
// writes from both services regardless of which one saved the data.
// =============================================================

import {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "./restaurantStorageService";

// Signature dishes = items marked BOTH bestSeller AND chefRecommended.
export async function getSignatureItems() {
  const items = await getMenuItems();
  return items.filter((item) => item.bestSeller && item.chefRecommended);
}

// Listens to all three event names used across both services.
// Returns an unsubscribe function — safe to call in useEffect cleanup.
export function onMenuDataChange(callback) {
  const storageHandler = (e) => {
    if (!e.key || e.key === "menu_items") callback();
  };
  window.addEventListener("restaurantDataUpdated", callback);
  window.addEventListener("restaurant-data-change", callback);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("restaurantDataUpdated", callback);
    window.removeEventListener("restaurant-data-change", callback);
    window.removeEventListener("storage", storageHandler);
  };
}

// Alias so HomePage.jsx's existing import still works unchanged.
export { onMenuDataChange as onRestaurantDataChange };

export { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem };
