import { motion } from 'framer-motion';
import Badge from './Badge';

export default function FoodCard({ item, index = 0 }) {
  const { name, tamilName, description, price, isSpicy, isVeg, isSignature, tags = [], image } = item;

  return (
    <motion.div
      className="group relative bg-charcoal-mid border border-white/5 hover:border-gold/20 transition-colors duration-500 overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08, ease: 'easeOut' }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-card-overlay opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {/* Signature ribbon */}
        {isSignature && (
          <div className="absolute top-3 left-0 bg-gold-gradient text-charcoal-deep text-[10px] font-body font-bold tracking-widest uppercase px-3 py-1">
            Signature
          </div>
        )}

        {/* Diet badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={isVeg ? 'veg' : 'tag'}>
            {isVeg ? 'Veg' : 'Non-Veg'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Name */}
        <div className="mb-2">
          <h3 className="font-display text-cream text-lg leading-snug group-hover:text-gold transition-colors duration-300">
            {name}
          </h3>
          <p className="font-tamil text-gold/60 text-sm mt-0.5">{tamilName}</p>
        </div>

        {/* Description */}
        <p className="prose-cream text-sm leading-relaxed flex-1 mb-4 line-clamp-2">
          {description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {isSpicy && <Badge variant="spicy">Spicy</Badge>}
            {tags.map((tag) => (
              <Badge key={tag} variant="tag">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
          <span className="font-display text-gold text-xl font-semibold">
            ₹{price}
          </span>
          <span className="text-cream-text/40 text-xs font-body tracking-wider uppercase">
            per serving
          </span>
        </div>
      </div>
    </motion.div>
  );
}
