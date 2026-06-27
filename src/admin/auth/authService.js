// src/admin/auth/authService.js
// ─────────────────────────────────────────────────────────────
// Admin authentication — now backed by the real FastAPI backend
// (POST /auth/login) instead of hardcoded credentials.
// Stores the real JWT + user profile in localStorage under the same
// keys as before (admin_token / admin_user), so logging out or
// clearing auth never touches restaurant data, and ProtectedRoute /
// AdminLoginPage do not need to change how they call this file.
// ─────────────────────────────────────────────────────────────

import api from "../../services/api";

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

/**
 * Attempt to log in against the backend. Returns the admin user object
 * on success, or throws an Error with a friendly message on failure
 * (the api.js response interceptor already turns backend error
 * responses into readable Error messages).
 */
export async function login(username, password) {
  const trimmedUser = (username || "").trim();

  const response = await api.post("/auth/login", {
    identifier: trimmedUser,
    password,
  });

  const { access_token } = response.data;

  // The login response only carries the token, so fetch the actual
  // user profile to store under USER_KEY (used by getCurrentAdmin()).
  localStorage.setItem(TOKEN_KEY, access_token);
  const meResponse = await api.get("/auth/me");
  const user = meResponse.data;

  localStorage.setItem(USER_KEY, JSON.stringify(user));

  return user;
}

/**
 * Clear admin auth only. Never touches restaurant data
 * (menu_items, reservations, gallery_images, offers, restaurant_settings
 * all live under different keys in restaurantStore.js).
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

export function getCurrentAdmin() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}
