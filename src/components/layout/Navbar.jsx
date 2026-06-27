import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Phone } from 'lucide-react';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import MobileMenu from './MobileMenu';

const navLinks = [
  { path: '/',            label: 'Home' },
  { path: '/menu',        label: 'Menu' },
  { path: '/about',       label: 'About' },
  { path: '/gallery',     label: 'Gallery' },
  { path: '/contact',     label: 'Contact' },
];

export default function Navbar() {
  const { isScrolled } = useScrollPosition();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-30 transition-all duration-500"
        animate={{
          backgroundColor: isScrolled ? 'rgba(20,0,8,0.97)' : 'rgba(0,0,0,0)',
          boxShadow: isScrolled ? '0 1px 0 rgba(201,150,42,0.15)' : '0 0 0 transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {/* Top accent line — only visible when scrolled */}
        <motion.div
          className="h-px bg-gold-gradient"
          animate={{ opacity: isScrolled ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <NavLink to="/" className="flex flex-col leading-none group">
              <span className="font-display text-gold text-xl font-semibold tracking-wide group-hover:text-gold-light transition-colors duration-300">
                Kaara Saaram
              </span>
              <span className="font-tamil text-cream-text text-xs tracking-wider group-hover:text-gold transition-colors duration-300">
                கார சாரம் உணவகம்
              </span>
            </NavLink>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-5">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-2 text-cream-text hover:text-gold transition-colors duration-300 text-sm"
              >
                <Phone size={14} className="text-gold" />
                <span className="font-body tracking-wide">+91 98765 43210</span>
              </a>
              <NavLink
                to="/reservation"
                className="px-5 py-2 text-xs font-body font-bold tracking-widest uppercase bg-gold-gradient text-charcoal-deep hover:shadow-gold transition-all duration-300 hover:-translate-y-px"
              >
                Reserve a Table
              </NavLink>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-cream-text hover:text-gold transition-colors"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </motion.header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
