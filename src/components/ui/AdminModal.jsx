// src/admin/components/AdminModal.jsx
import { useEffect } from "react";

export default function AdminModal({ open, onClose, title, children, width = "max-w-2xl" }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10,4,4,0.85)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full ${width} max-h-[90vh] flex flex-col rounded-2xl overflow-hidden`}
        style={{
          background: "linear-gradient(160deg, #1e0d0d 0%, #2a1010 100%)",
          border: "1px solid rgba(212,175,55,0.2)",
          boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.05)",
          animation: "modalIn 0.2s ease-out",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}
        >
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#D4AF37",
              letterSpacing: "0.02em",
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "rgba(255,248,240,0.6)",
              fontSize: "0.85rem",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
