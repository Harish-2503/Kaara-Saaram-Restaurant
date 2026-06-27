import { motion } from 'framer-motion';

export default function SectionHeader({ eyebrow, title, tamilTitle, subtitle, centered = true, light = false }) {
  return (
    <motion.div
      className={`mb-16 ${centered ? 'text-center' : ''}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {eyebrow && (
        <p className="section-eyebrow mb-3">{eyebrow}</p>
      )}
      <h2 className={`section-title mb-2 ${light ? 'text-charcoal' : ''}`}>
        {title}
      </h2>
      {tamilTitle && (
        <p className="tamil-text text-gold text-xl font-light tracking-wide mb-4">{tamilTitle}</p>
      )}
      <div className={`gold-divider ${centered ? '' : 'mx-0'}`} />
      {subtitle && (
        <p className={`prose-cream mt-6 max-w-2xl ${centered ? 'mx-auto' : ''} text-base`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
