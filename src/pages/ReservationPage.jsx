import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import GoldDivider from '../components/ui/GoldDivider';
import { addReservation } from '../services/restaurantStore';
import { restaurantInfo } from '../data/restaurantData';
// src/services/reservationService.js


const inputClass = 'w-full bg-charcoal-mid border border-white/10 text-cream placeholder-cream-text/40 px-4 py-3 text-sm font-body focus:outline-none focus:border-gold/50 transition-colors duration-200';
const labelClass = 'block text-cream-text text-xs font-body tracking-widest uppercase mb-2';

export default function ReservationPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', time: '', guests: '2', occasion: '', requests: '' });
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [error, setError] = useState('');

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // addReservation() now calls the FastAPI backend (POST /reservations)
      // instead of writing straight to localStorage, so this is a real
      // network request that can fail (validation error, backend down, etc.).
      const reservation = await addReservation(form);
      setConfirmed(`KS-${reservation.id}`);
    } catch (err) {
      setError(err?.message || 'Could not submit your reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (confirmed) return (
    <div className="bg-charcoal-deep min-h-screen flex items-center justify-center px-6">
      <motion.div className="text-center max-w-md" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <CheckCircle className="text-gold mx-auto mb-6" size={56} />
        <h2 className="font-display text-cream text-3xl mb-3">Reservation Confirmed</h2>
        <p className="font-tamil text-gold text-lg mb-6">முன்பதிவு உறுதிப்படுத்தப்பட்டது</p>
        <GoldDivider className="mb-6" />
        <p className="prose-cream text-sm mb-2">Your confirmation ID:</p>
        <p className="font-display text-gold text-2xl mb-6">{confirmed}</p>
        <p className="prose-cream text-sm">We will contact you at <span className="text-cream">{form.phone}</span> to confirm your booking. We look forward to welcoming you.</p>
      </motion.div>
    </div>
  );

  return (
    <div className="bg-charcoal-deep min-h-screen">
      {/* Header */}
      <div className="relative pt-40 pb-20 px-6 text-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #500d1e 0%, #141414 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #c9962a 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10">
          <p className="section-eyebrow mb-4">Book Your Experience</p>
          <h1 className="font-display text-cream text-5xl md:text-6xl mb-3">Reserve a Table</h1>
          <p className="font-tamil text-gold text-xl">முன்பதிவு செய்யுங்கள்</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Form */}
        <motion.form onSubmit={submit} className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div><label className={labelClass}>Full Name *</label><input name="name" value={form.name} onChange={handle} required placeholder="Your name" className={inputClass} /></div>
            <div><label className={labelClass}>Phone *</label><input name="phone" value={form.phone} onChange={handle} required placeholder="+91 XXXXX XXXXX" className={inputClass} /></div>
            <div><label className={labelClass}>Email</label><input name="email" type="email" value={form.email} onChange={handle} placeholder="your@email.com" className={inputClass} /></div>
            <div><label className={labelClass}>Guests *</label>
              <select name="guests" value={form.guests} onChange={handle} className={inputClass}>
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>)}
                <option value="9+">9+ (Call us)</option>
              </select>
            </div>
            <div><label className={labelClass}>Date *</label><input name="date" type="date" value={form.date} onChange={handle} required className={inputClass} /></div>
            <div><label className={labelClass}>Time *</label>
              <select name="time" value={form.time} onChange={handle} required className={inputClass}>
                <option value="">Select a time</option>
                <optgroup label="Lunch">
                  {['12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
                </optgroup>
                <optgroup label="Dinner">
                  {['7:00 PM','7:30 PM','8:00 PM','8:30 PM','9:00 PM','9:30 PM','10:00 PM'].map(t => <option key={t} value={t}>{t}</option>)}
                </optgroup>
              </select>
            </div>
          </div>
          <div><label className={labelClass}>Occasion</label>
            <select name="occasion" value={form.occasion} onChange={handle} className={inputClass}>
              <option value="">Select occasion (optional)</option>
              {['Birthday','Anniversary','Business Dinner','Family Gathering','Date Night','Other'].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div><label className={labelClass}>Special Requests</label>
            <textarea name="requests" value={form.requests} onChange={handle} placeholder="Dietary requirements, seating preferences, allergies..." rows={3} className={`${inputClass} resize-none`} />
          </div>
          {error && (
            <p className="text-red-400 text-xs font-body">{error}</p>
          )}
          <Button type="submit" size="lg" loading={loading} className="w-full sm:w-auto">
            Confirm Reservation
          </Button>
        </motion.form>

        {/* Info sidebar */}
        <motion.div className="space-y-8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <div>
            <p className="section-eyebrow mb-4 text-left">Opening Hours</p>
            <div className="space-y-4">
              {restaurantInfo.hours.map((h) => (
                <div key={h.days} className="border-b border-gold/10 pb-4">
                  <p className="text-cream text-sm font-body font-bold mb-1">{h.days}</p>
                  <p className="text-cream-text text-xs">Lunch: {h.lunch}</p>
                  <p className="text-cream-text text-xs">Dinner: {h.dinner}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="section-eyebrow mb-4 text-left">Contact</p>
            <p className="text-cream-text text-sm mb-1">{restaurantInfo.phone}</p>
            <p className="text-cream-text text-sm">{restaurantInfo.email}</p>
          </div>
          <div className="border border-gold/10 p-4">
            <p className="text-cream-text text-xs leading-relaxed">For groups of 9 or more, please call us directly or email to arrange a private dining experience.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
