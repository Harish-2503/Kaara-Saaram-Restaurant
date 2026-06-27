// src/services/uploadService.js
// ─────────────────────────────────────────────────────────────
// Wraps the backend POST /upload endpoint.
// Returns the hosted URL to store as image_url / url / src.
// Uses the same api.js interceptor so the admin JWT is attached.
// ─────────────────────────────────────────────────────────────

import axios from "axios";
import { BASE_URL } from "./api";

/**
 * Upload a File object to the backend.
 * Returns the URL string (e.g. "/uploads/abc123.jpg") on success.
 * Throws an Error with a readable message on failure.
 *
 * @param {File} file — a File object from an <input type="file">
 * @returns {Promise<string>} — the hosted URL
 */
export async function uploadImage(file) {
  const token = localStorage.getItem("admin_token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  return response.data.url;
}
