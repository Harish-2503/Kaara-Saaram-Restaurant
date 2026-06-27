import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import FoodCard from '../components/ui/FoodCard';
import Button from '../components/ui/Button';
import GoldDivider from '../components/ui/GoldDivider';
import StarRating from '../components/ui/StarRating';
import { getSignatureItems, onDataChange, initStore } from '../services/restaurantStore';
import { restaurantInfo, testimonials } from '../data/restaurantData';

const stats = [
  { value: '67+',  label: 'Chettinad Spices',   tamilLabel: 'மசாலாப் பொருட்கள்' },
  { value: '5',    label: 'Years of Heritage',   tamilLabel: 'ஆண்டுகள் அனுபவம்' },
  { value: '12K+', label: 'Happy Guests',        tamilLabel: 'மகிழ்ச்சியான விருந்தினர்' },
  { value: '100%', label: 'Authentic Recipes',   tamilLabel: 'நம்பகமான சமையல்' },
];

export default function HomePage() {
  const [signatures, setSignatures] = useState([]);

  useEffect(() => {
    initStore();
    const load = () => setSignatures(getSignatureItems().slice(0, 4));
    load();
    return onDataChange(load);
  }, []);

  return (
    <div className="bg-charcoal-deep">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80" alt="Kaara Saaram restaurant interior" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero-overlay" />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep/60 via-transparent to-transparent" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.p className="section-eyebrow mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            Est. {restaurantInfo.established} · Chennai, Tamil Nadu
          </motion.p>
          <motion.h1 className="font-display text-cream text-5xl md:text-7xl lg:text-8xl leading-none font-semibold mb-4 text-shadow-sm" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }}>
            {restaurantInfo.name}
          </motion.h1>
          <motion.p className="font-tamil text-gold text-2xl md:text-3xl mb-6 text-shadow-gold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.55 }}>
            {restaurantInfo.tamilName}
          </motion.p>
          <motion.p className="font-accent text-cream-text text-lg md:text-xl italic mb-12 max-w-lg mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.7 }}>
            {restaurantInfo.tagline}
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}>
            <Link to="/reservation"><Button size="lg">Reserve a Table</Button></Link>
            <Link to="/menu"><Button variant="outline" size="lg">Explore Menu <ArrowRight size={15} /></Button></Link>
          </motion.div>
        </div>
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 0.6 }}>
          <span className="text-cream-text/50 text-xs tracking-widest uppercase font-body">Scroll</span>
          <motion.div className="w-px h-12 bg-gradient-to-b from-gold/60 to-transparent" animate={{ scaleY: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: 'top' }} />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-maroon-deep border-y border-gold/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} className="text-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <p className="font-display text-gold text-4xl font-bold mb-1">{s.value}</p>
              <p className="font-body text-cream text-sm tracking-wide mb-1">{s.label}</p>
              <p className="font-tamil text-cream-text/50 text-xs">{s.tamilLabel}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Signature dishes */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <SectionHeader eyebrow="From Our Kitchen" title="Signature Dishes" tamilTitle="சிறப்பு உணவுகள்" subtitle="Each dish is rooted in a distinct culinary tradition of Tamil Nadu — Chettinad, Kongu, Coastal, and Temple cuisine." />
        {signatures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {signatures.map((item, i) => <FoodCard key={item.id} item={item} index={i} />)}
          </div>
        ) : (
          <p className="text-center text-cream-text/40 text-sm font-body py-8">
            No signature dishes marked yet — mark items as both Best Seller and Chef Recommended in the admin Menu Manager.
          </p>
        )}
        <div className="text-center mt-12">
          <Link to="/menu"><Button variant="outline">View Full Menu <ArrowRight size={14} /></Button></Link>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-24 bg-charcoal-mid">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div className="relative" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80" alt="Kaara Saaram dining room" className="w-full aspect-[4/3] object-cover" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 border border-gold/20 hidden lg:block" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-maroon-deep/60 hidden lg:block" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <p className="section-eyebrow mb-4">Our Story</p>
            <h2 className="font-display text-cream text-4xl md:text-5xl leading-tight mb-3">Born from the<br /><span className="text-gold italic">Soul of Tamil Nadu</span></h2>
            <p className="font-tamil text-gold/60 text-lg mb-6">தமிழ்நாட்டின் சுவை கலாசாரம்</p>
            <GoldDivider className="mb-8 max-w-xs" />
            <p className="prose-cream text-base leading-loose mb-8">{restaurantInfo.description}</p>
            <Link to="/about"><Button variant="outline">Our Story <ArrowRight size={14} /></Button></Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <SectionHeader eyebrow="Guest Voices" title="What They Say" tamilTitle="விருந்தினர் கருத்துகள்" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={t.id} className="bg-charcoal-mid border border-white/5 p-6 flex flex-col gap-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <StarRating rating={t.rating} />
              <p className="prose-cream text-sm leading-relaxed flex-1 italic">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-cream text-sm font-body font-bold">{t.name}</p>
                  <p className="text-cream-text/50 text-xs">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reservation CTA */}
      <section className="relative py-28 px-6 text-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #500d1e 0%, #7a1d38 60%, #1e1e1e 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #c9962a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.p className="section-eyebrow mb-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>Book Your Table</motion.p>
          <motion.h2 className="font-display text-cream text-4xl md:text-5xl mb-4" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>An Unforgettable Evening Awaits</motion.h2>
          <p className="font-tamil text-gold/70 text-lg mb-10">உங்கள் இடத்தை முன்பதிவு செய்யுங்கள்</p>
          <Link to="/reservation"><Button size="lg">Reserve a Table</Button></Link>
        </div>
      </section>
    </div>
  );
}
