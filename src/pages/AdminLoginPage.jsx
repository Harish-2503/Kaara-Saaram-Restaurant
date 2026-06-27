import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import Button from "../components/ui/Button";
import GoldDivider from "../components/ui/GoldDivider";
import { login, isAuthenticated } from "../admin/auth/authService";

const REMEMBER_KEY = "admin_remember_username";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, skip straight to the dashboard.
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin", { replace: true });
      return;
    }
    const savedUsername = localStorage.getItem(REMEMBER_KEY);
    if (savedUsername) {
      setUsername(savedUsername);
      setRemember(true);
    }
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    // login() now calls the real backend (POST /auth/login), so this
    // is an actual network request rather than an artificial delay.
    (async () => {
      try {
        await login(username, password);
        if (remember) {
          localStorage.setItem(REMEMBER_KEY, username.trim());
        } else {
          localStorage.removeItem(REMEMBER_KEY);
        }
        navigate("/admin", { replace: true });
      } catch (err) {
        setError(err?.message || "Invalid username or password");
        setLoading(false);
      }
    })();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg, #1a0a0a 0%, #2d0f0f 55%, #120606 100%)" }}
    >
      {/* Decorative dot-grid texture, consistent with customer pages */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)", backgroundSize: "28px 28px" }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div
          className="rounded-2xl p-8 sm:p-10"
          style={{
            background: "linear-gradient(160deg, rgba(30,13,13,0.9), rgba(42,16,16,0.9))",
            border: "1px solid rgba(212,175,55,0.18)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #8B0000, #D4AF37)" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <span style={{ fontFamily: "serif", fontSize: "1.4rem", color: "#FFF8F0", fontWeight: 700 }}>க</span>
            </motion.div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.6rem", fontWeight: 700, color: "#FFF8F0" }}>
              Kaara Saaram Restaurant
            </h1>
            <p style={{ fontFamily: "serif", fontSize: "1rem", color: "#D4AF37", marginTop: 4 }}>
              கார சாரம் உணவகம்
            </p>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,248,240,0.4)", marginTop: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Owner / Admin Login
            </p>
          </div>

          <GoldDivider className="mb-8" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label
                style={{ fontSize: "0.7rem", color: "rgba(255,248,240,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}
                className="block mb-2"
              >
                Username
              </label>
              <div className="relative">
                <User
                  size={16}
                  style={{ color: "rgba(212,175,55,0.5)" }}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-lg outline-none transition-colors"
                  style={{
                    background: "rgba(255,248,240,0.04)",
                    border: "1px solid rgba(212,175,55,0.15)",
                    color: "#FFF8F0",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.15)")}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                style={{ fontSize: "0.7rem", color: "rgba(255,248,240,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}
                className="block mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  style={{ color: "rgba(212,175,55,0.5)" }}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-lg outline-none transition-colors"
                  style={{
                    background: "rgba(255,248,240,0.04)",
                    border: "1px solid rgba(212,175,55,0.15)",
                    color: "#FFF8F0",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(212,175,55,0.15)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(212,175,55,0.6)" }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-amber-600"
              />
              <span style={{ fontSize: "0.78rem", color: "rgba(255,248,240,0.55)" }}>Remember me</span>
            </label>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg overflow-hidden"
                  style={{ background: "rgba(139,0,0,0.18)", border: "1px solid rgba(139,0,0,0.4)" }}
                >
                  <AlertCircle size={15} style={{ color: "#fca5a5", flexShrink: 0 }} />
                  <span style={{ fontSize: "0.78rem", color: "#fca5a5" }}>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" variant="primary" size="md" loading={loading} className="w-full justify-center">
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p
            className="text-center mt-7"
            style={{ fontSize: "0.68rem", color: "rgba(255,248,240,0.25)", letterSpacing: "0.05em" }}
          >
            Kaara Saaram Admin Panel · v1.0 · localStorage Mode
          </p>
        </div>
      </motion.div>
    </div>
  );
}
