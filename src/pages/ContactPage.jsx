import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import GoldDivider from '../components/ui/GoldDivider';
import { submitContactForm } from '../Service/reservationService';
import { restaurantInfo } from '../data/restaurantData';

const inputClass = 'w-full bg-charcoal-mid border border-white/10 text-cream placeholder-cream-text/40 px-4 py-3 text-sm font-body focus:outline-none focus:border-gold/50 transition-colors duration-200';
const labelClass = 'block text-cream-text text-xs font-body tracking-widest uppercase mb-2';

const contactItems = [
  { icon: Phone, label: 'Phone', value: restaurantInfo.phone, href: `tel:${restaurantInfo.phone}` },
  { icon: Mail,  label: 'Email', value: restaurantInfo.email, href: `mailto:${restaurantInfo.email}` },
  { icon: MapPin, label: 'Address', value: `${restaurantInfo.address.street}, ${restaurantInfo.address.area}, ${restaurantInfo.address.city} – ${restaurantInfo.address.pincode}`, href: null },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await submitContactForm(form);
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="bg-charcoal-deep min-h-screen">
      {/* Header */}
      <div className="relative pt-40 pb-20 px-6 text-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #500d1e 0%, #141414 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #c9962a 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10">
          <p className="section-eyebrow mb-4">Get In Touch</p>
          <h1 className="font-display text-cream text-5xl md:text-6xl mb-3">Contact Us</h1>
          <p className="font-tamil text-gold text-xl">தொடர்பு கொள்ளுங்கள்</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <p className="section-eyebrow mb-4 text-left">Find Us</p>
          <h2 className="font-display text-cream text-3xl mb-4">We'd Love to Hear From You</h2>
          <GoldDivider className="mb-8 max-w-xs" />
          <div className="space-y-6 mb-10">
            {contactItems.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 border border-gold/20 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-gold" />
                </div>
                <div>
                  <p className="text-cream-text text-xs tracking-widest uppercase font-body mb-1">{label}</p>
                  {href
                    ? <a href={href} className="text-cream text-sm hover:text-gold transition-colors">{value}</a>
                    : <p className="text-cream text-sm">{value}</p>}
                </div>
              </div>
            ))}
          </div>
          <p className="section-eyebrow mb-4 text-left">Opening Hours</p>
          <div className="space-y-3">
            {restaurantInfo.hours.map((h) => (
              <div key={h.days} className="flex items-start gap-3 border-b border-white/5 pb-3">
                <Clock size={14} className="text-gold mt-0.5 shrink-0" />
                <div>
                  <p className="text-cream text-sm font-bold">{h.days}</p>
                  <p className="text-cream-text text-xs">Lunch: {h.lunch} &nbsp;|&nbsp; Dinner: {h.dinner}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <CheckCircle className="text-gold mb-4" size={48} />
              <h3 className="font-display text-cream text-2xl mb-3">Message Sent</h3>
              <p className="prose-cream text-sm">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <p className="section-eyebrow mb-6 text-left">Send a Message</p>
              <div><label className={labelClass}>Name *</label><input name="name" value={form.name} onChange={handle} required placeholder="Your full name" className={inputClass} /></div>
              <div><label className={labelClass}>Email *</label><input name="email" type="email" value={form.email} onChange={handle} required placeholder="your@email.com" className={inputClass} /></div>
              <div><label className={labelClass}>Phone</label><input name="phone" value={form.phone} onChange={handle} placeholder="+91 XXXXX XXXXX" className={inputClass} /></div>
              <div><label className={labelClass}>Message *</label><textarea name="message" value={form.message} onChange={handle} required placeholder="How can we help you?" rows={5} className={`${inputClass} resize-none`} /></div>
              <Button type="submit" size="lg" loading={loading} className="w-full">Send Message</Button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
