// src/services/api.js
// ─────────────────────────────────────────────────────────────
// Central Axios client for talking to the FastAPI backend.
//
// BASE URL: relative "/api" — works from both:
//   • Production : http://localhost:8000  (FastAPI serves everything)
//   • Development: http://localhost:5173  (Vite dev proxy forwards /api → 8000)
//
// - Request interceptor: attaches the admin JWT as Authorization: Bearer
// - Response interceptor: normalizes errors into a single Error shape
// ─────────────────────────────────────────────────────────────

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Authorization interceptor ──────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Something went wrong. Please try again.";

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        message = "Your session has expired. Please log in again.";
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      } else if (status === 403) {
        message = data?.detail || "You don't have permission to do that.";
      } else if (status === 404) {
        message = data?.detail || "That item could not be found.";
      } else if (status === 409) {
        message = data?.detail || "That already exists.";
      } else if (status === 422) {
        if (Array.isArray(data?.detail)) {
          message = data.detail.map((d) => d.msg).join(", ");
        } else {
          message = data?.detail || "Some fields are invalid.";
        }
      } else if (data?.detail) {
        message = data.detail;
      }
    } else if (error.request) {
      message = "Could not reach the server. Is the backend running?";
    }

    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    normalizedError.original = error;
    return Promise.reject(normalizedError);
  }
);

export default api;
