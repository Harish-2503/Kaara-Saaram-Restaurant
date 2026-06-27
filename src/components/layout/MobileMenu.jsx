import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Mail } from 'lucide-react';
import { restaurantInfo } from '../../data/restaurantData';

const navLinks = [
  { path: '/',           label: 'Home',        tamil: 'முகப்பு' },
  { path: '/menu',       label: 'Menu',        tamil: 'மெனு' },
  { path: '/about',      label: 'About',       tamil: 'எங்களை பற்றி' },
  { path: '/gallery',    label: 'Gallery',     tamil: 'கேலரி' },
  { path: '/reservation',label: 'Reservation', tamil: 'முன்பதிவு' },
  { path: '/contact',    label: 'Contact',     tamil: 'தொடர்பு' },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:   { opacity: 0, transition: { duration: 0.25 } },
};

const drawerVariants = {
  hidden:  { x: '100%' },
  visible: { x: 0, transition: { type: 'tween', ease: [0.25, 0.46, 0.45, 0.94], duration: 0.4 } },
  exit:    { x: '100%', transition: { type: 'tween', ease: [0.55, 0.06, 0.68, 0.19], duration: 0.35 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: 24 },
  visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.07 + 0.15, duration: 0.35 } }),
};

export default function MobileMenu({ isOpen, onClose }) {
  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-charcoal-deep/80 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 z-50 h-full w-80 max-w-[90vw] flex flex-col"
            style={{ background: 'linear-gradient(160deg, #500d1e 0%, #1e1e1e 60%, #141414 100%)' }}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/10">
              <div>
                <p className="font-display text-gold text-lg leading-tight">Kaara Saaram</p>
                <p className="font-tamil text-cream-text text-sm">கார சாரம் உணவகம்</p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center text-cream-text hover:text-gold transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-6 py-8 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.div key={link.path} custom={i} variants={itemVariants} initial="hidden" animate="visible">
                  <NavLink
                    to={link.path}
                    end={link.path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center justify-between py-3.5 border-b border-white/5 transition-colors duration-200 ${
                        isActive ? 'text-gold' : 'text-cream-text hover:text-gold'
                      }`
                    }
                  >
                    <span className="font-body text-sm tracking-widest uppercase">{link.label}</span>
                    <span className="font-tamil text-xs opacity-50 group-hover:opacity-100 transition-opacity">{link.tamil}</span>
                  </NavLink>
                </motion.div>
              ))}
            </nav>

            {/* Footer info */}
            <div className="px-6 py-6 border-t border-gold/10 space-y-3">
              <a href={`tel:${restaurantInfo.phone}`} className="flex items-center gap-3 text-cream-text hover:text-gold transition-colors text-sm">
                <Phone size={14} className="text-gold shrink-0" />
                {restaurantInfo.phone}
              </a>
              <a href={`mailto:${restaurantInfo.email}`} className="flex items-center gap-3 text-cream-text hover:text-gold transition-colors text-sm break-all">
                <Mail size={14} className="text-gold shrink-0" />
                {restaurantInfo.email}
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
