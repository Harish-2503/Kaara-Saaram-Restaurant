import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getGalleryItems, onDataChange, initStore } from "../services/restaurantStore";

const CATEGORIES = ["all", "food", "ambience", "kitchen"];

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    initStore();
    const load = () => setGalleryImages(getGalleryItems());
    load();
    return onDataChange(load);
  }, []);

  const filtered = activeFilter === "all"
    ? galleryImages
    : galleryImages.filter((img) => (img.categoryLower || img.category?.toLowerCase()) === activeFilter);

  return (
    <div className="bg-charcoal-deep min-h-screen">
      <div className="relative pt-40 pb-20 px-6 text-center overflow-hidden"
        style={{ background: "linear-gradient(180deg, #500d1e 0%, #141414 100%)" }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #c9962a 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative z-10">
          <p className="section-eyebrow mb-4">கார சாரம் உணவகம்</p>
          <h1 className="font-display text-cream text-5xl md:text-6xl mb-3">Gallery</h1>
          <p className="font-tamil text-gold text-xl">படத் தொகுப்பு</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="flex gap-3 mb-12 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-5 py-2 text-xs font-body tracking-widest uppercase transition-all duration-200 border ${
                activeFilter === cat ? "border-gold text-gold bg-gold/5" : "border-white/10 text-cream-text hover:border-gold/40 hover:text-cream"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            className="columns-1 sm:columns-2 lg:columns-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.map((img, i) => (
              <motion.div
                key={img.id}
                className="mb-4 break-inside-avoid cursor-pointer group relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onClick={() => setLightbox(img)}
              >
                <img src={img.src || img.url} alt={img.alt || img.caption} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-charcoal-deep/0 group-hover:bg-charcoal-deep/40 transition-all duration-300 flex items-end p-4 opacity-0 group-hover:opacity-100">
                  <p className="text-cream text-sm font-body">{img.alt || img.caption}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <p className="text-center text-cream-text/40 text-sm font-body py-16">No images in this category yet.</p>
        )}
      </div>

      {lightbox && (
        <motion.div
          className="fixed inset-0 z-50 bg-charcoal-deep/95 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-6 right-6 text-cream-text hover:text-cream transition-colors">
            <X size={28} />
          </button>
          <img src={lightbox.src || lightbox.url} alt={lightbox.alt || lightbox.caption} className="max-w-full max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
        </motion.div>
      )}
    </div>
  );
}
