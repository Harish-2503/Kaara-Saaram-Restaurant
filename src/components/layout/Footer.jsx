import { NavLink } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Youtube } from 'lucide-react';
import { restaurantInfo } from '../../data/restaurantData';
import GoldDivider from '../ui/GoldDivider';

const quickLinks = [
  { path: '/',            label: 'Home' },
  { path: '/menu',        label: 'Our Menu' },
  { path: '/about',       label: 'About Us' },
  { path: '/gallery',     label: 'Gallery' },
  { path: '/reservation', label: 'Reserve a Table' },
  { path: '/contact',     label: 'Contact' },
];

const socialIcons = {
  instagram: Instagram,
  facebook:  Facebook,
  youtube:   Youtube,
};

export default function Footer() {
  const { address, hours, phone, email, social } = restaurantInfo;

  return (
    <footer className="bg-charcoal-deep border-t border-gold/10">

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <p className="font-display text-gold text-2xl font-semibold leading-tight">
                Kaara Saaram
              </p>
              <p className="font-tamil text-gold/70 text-base mt-0.5">
                கார சாரம் உணவகம்
              </p>
            </div>
            <p className="prose-cream text-sm leading-relaxed mb-6">
              {restaurantInfo.tagline} — {restaurantInfo.tamilTagline}
            </p>
            <p className="text-cream-text/50 text-xs font-body tracking-wider uppercase">
              Est. {restaurantInfo.established}
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 mt-6">
              {Object.entries(social).map(([platform, url]) => {
                const Icon = socialIcons[platform];
                if (!Icon) return null;
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="w-9 h-9 flex items-center justify-center border border-gold/20 text-cream-text hover:text-gold hover:border-gold/50 transition-all duration-300"
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="section-eyebrow mb-5 text-left">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className="text-cream-text hover:text-gold transition-colors duration-200 text-sm font-body flex items-center gap-2 group"
                  >
                    <span className="w-3 h-px bg-gold/40 group-hover:w-5 group-hover:bg-gold transition-all duration-300" />
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening hours */}
          <div>
            <h3 className="section-eyebrow mb-5 text-left">Opening Hours</h3>
            <div className="space-y-4">
              {hours.map((slot) => (
                <div key={slot.days} className="border-b border-gold/10 pb-4 last:border-0">
                  <p className="text-cream text-sm font-body font-bold mb-1.5 flex items-center gap-2">
                    <Clock size={12} className="text-gold shrink-0" />
                    {slot.days}
                  </p>
                  <p className="text-cream-text text-xs pl-5">Lunch: {slot.lunch}</p>
                  <p className="text-cream-text text-xs pl-5">Dinner: {slot.dinner}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="section-eyebrow mb-5 text-left">Contact Us</h3>
            <div className="space-y-4">
              <a
                href={`tel:${phone}`}
                className="flex items-start gap-3 text-cream-text hover:text-gold transition-colors duration-200 group"
              >
                <Phone size={14} className="text-gold mt-0.5 shrink-0" />
                <span className="text-sm">{phone}</span>
              </a>
              <a
                href={`mailto:${email}`}
                className="flex items-start gap-3 text-cream-text hover:text-gold transition-colors duration-200 group"
              >
                <Mail size={14} className="text-gold mt-0.5 shrink-0" />
                <span className="text-sm break-all">{email}</span>
              </a>
              <div className="flex items-start gap-3 text-cream-text">
                <MapPin size={14} className="text-gold mt-0.5 shrink-0" />
                <address className="text-sm not-italic leading-relaxed">
                  {address.street},<br />
                  {address.area},<br />
                  {address.city} – {address.pincode},<br />
                  {address.state}
                </address>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-cream-text/40 text-xs font-body text-center sm:text-left">
            © {new Date().getFullYear()} Kaara Saaram Restaurant. All rights reserved.
          </p>
          <p className="font-tamil text-gold/30 text-xs">
            கார சாரம் உணவகம்
          </p>
        </div>
      </div>
    </footer>
  );
}
