import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../components/ui/SectionHeader';
import FoodCard from '../components/ui/FoodCard';
import { menuCategories } from '../data/menuData';
import { getMenuItems, onDataChange, initStore } from '../services/restaurantStore';

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStore();
    const load = () => {
      setMenuItems(getMenuItems());
      setLoading(false);
    };
    load();
    return onDataChange(load);
  }, []);

  const visibleItems = menuItems.filter((item) => item.availability !== false);
  const filtered = visibleItems.filter((item) => item.category === activeCategory);

  return (
    <div className="bg-charcoal-deep min-h-screen">
      <div className="relative pt-40 pb-20 px-6 text-center overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #500d1e 0%, #141414 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #c9962a 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10">
          <p className="section-eyebrow mb-4">கார சாரம் உணவகம்</p>
          <h1 className="font-display text-cream text-5xl md:text-6xl mb-3">Our Menu</h1>
          <p className="font-tamil text-gold text-xl">எங்கள் மெனு</p>
        </div>
      </div>

      <div className="sticky top-20 z-20 bg-charcoal-deep/95 backdrop-blur-sm border-b border-gold/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex gap-1 overflow-x-auto py-4 scrollbar-hide">
            {menuCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 flex flex-col items-center px-5 py-2 transition-all duration-200 border-b-2 ${
                  activeCategory === cat ? 'border-gold text-gold' : 'border-transparent text-cream-text hover:text-cream'
                }`}
              >
                <span className="font-body text-xs tracking-widest uppercase whitespace-nowrap">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="font-display text-cream text-2xl">{activeCategory}</h2>
          <span className="text-cream-text/40 text-sm font-body">{filtered.length} dishes</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              {filtered.map((item, i) => <FoodCard key={item.id} item={item} index={i} />)}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-cream-text/40 text-sm font-body">
            No dishes available in this category right now.
          </div>
        )}
      </div>
    </div>
  );
}
