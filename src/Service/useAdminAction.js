// useAdminStorage.js
// Shared hook that wraps async storage calls with loading + error + toast state.
// Import this in every admin panel instead of calling service functions directly.

import { useState, useCallback } from "react";

/**
 * Returns { run, loading, error }
 * run(asyncFn, successMsg?) — calls asyncFn, shows toast, handles errors
 */
export function useAdminAction(showToast) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (asyncFn, successMsg = "Saved successfully") => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn();
        if (showToast) showToast(successMsg, "success");
        return result;
      } catch (err) {
        const msg = err?.message || "Something went wrong";
        setError(msg);
        if (showToast) showToast(msg, "error");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  return { run, loading, error };
}
