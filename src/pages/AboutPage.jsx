import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeader from '../components/ui/SectionHeader';
import GoldDivider from '../components/ui/GoldDivider';
import Button from '../components/ui/Button';
import { restaurantInfo, chefs } from '../data/restaurantData';

const values = [
  { title: 'Heritage', tamil: 'பாரம்பரியம்', desc: 'Every recipe traces back to a specific region, family, or temple tradition of Tamil Nadu.' },
  { title: 'Authenticity', tamil: 'நம்பகத்தன்மை', desc: 'We source spices directly from Chettinad and grind them fresh each morning in our kitchen.' },
  { title: 'Craft', tamil: 'கைவினை', desc: 'Our chefs have trained for decades. Slow cooking, proper tempering, and patience define every dish.' },
];

export default function AboutPage() {
  return (
    <div className="bg-charcoal-deep min-h-screen">
      {/* Header */}
      <div className="relative pt-40 pb-20 px-6 text-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #500d1e 0%, #141414 100%)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, #c9962a 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10">
          <p className="section-eyebrow mb-4">Who We Are</p>
          <h1 className="font-display text-cream text-5xl md:text-6xl mb-3">Our Story</h1>
          <p className="font-tamil text-gold text-xl">எங்கள் கதை</p>
        </div>
      </div>

      {/* Story section */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <p className="section-eyebrow mb-4">Est. {restaurantInfo.established}</p>
          <h2 className="font-display text-cream text-4xl leading-tight mb-4">
            The Bold Soul of<br /><span className="text-gold italic">Tamil Nadu</span>
          </h2>
          <GoldDivider className="mb-8 max-w-xs" />
          <p className="prose-cream text-base leading-loose mb-6">{restaurantInfo.description}</p>
          <p className="prose-cream text-base leading-loose">
            We opened in {restaurantInfo.established} with a single mission: to preserve the endangered flavours of Tamil Nadu's regional kitchens and bring them to the table with the reverence they deserve.
          </p>
        </motion.div>
        <motion.div className="relative" initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80" alt="Chef at work" className="w-full aspect-[4/3] object-cover" />
          <div className="absolute -bottom-6 -left-6 w-36 h-36 border border-gold/20 hidden lg:block" />
        </motion.div>
      </section>

      {/* Values */}
      <section className="py-20 bg-charcoal-mid">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SectionHeader eyebrow="What We Stand For" title="Our Values" tamilTitle="எங்கள் மதிப்புகள்" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <motion.div key={v.title} className="border border-gold/10 p-8 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}>
                <h3 className="font-display text-gold text-2xl mb-1">{v.title}</h3>
                <p className="font-tamil text-gold/50 text-sm mb-4">{v.tamil}</p>
                <div className="gold-divider mb-4" />
                <p className="prose-cream text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chefs */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <SectionHeader eyebrow="The Hands Behind" title="Our Chefs" tamilTitle="எங்கள் சமையல்காரர்கள்" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
          {chefs.map((chef, i) => (
            <motion.div key={chef.id} className="flex flex-col items-center text-center" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.15 }}>
              <div className="relative mb-6">
                <img src={chef.image} alt={chef.name} className="w-40 h-40 object-cover rounded-full border-2 border-gold/30" />
                <div className="absolute -bottom-2 -right-2 bg-gold-gradient text-charcoal-deep text-[10px] font-bold uppercase tracking-wider px-2 py-1">
                  {chef.specialty}
                </div>
              </div>
              <h3 className="font-display text-cream text-xl mb-1">{chef.name}</h3>
              <p className="text-gold text-sm font-body tracking-wide mb-1">{chef.role}</p>
              <p className="font-tamil text-cream-text/50 text-xs mb-4">{chef.tamilRole}</p>
              <p className="prose-cream text-sm leading-relaxed">{chef.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center border-t border-gold/10">
        <p className="section-eyebrow mb-4">Experience It Yourself</p>
        <h2 className="font-display text-cream text-4xl mb-8">Ready to Dine With Us?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/reservation"><Button size="lg">Reserve a Table</Button></Link>
          <Link to="/menu"><Button variant="outline" size="lg">View Menu <ArrowRight size={14} /></Button></Link>
        </div>
      </section>
    </div>
  );
}
