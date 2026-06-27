import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-gold-gradient text-charcoal-deep font-body font-bold tracking-widest uppercase text-xs shadow-gold hover:shadow-gold-lg',
  outline: 'border border-gold text-gold font-body font-bold tracking-widest uppercase text-xs hover:bg-gold hover:text-charcoal-deep',
  ghost:   'text-cream-text font-body tracking-widest uppercase text-xs hover:text-gold border-b border-transparent hover:border-gold',
  maroon:  'bg-maroon text-cream font-body font-bold tracking-widest uppercase text-xs hover:bg-maroon-950',
  light:   'bg-cream text-charcoal-deep font-body font-bold tracking-widest uppercase text-xs hover:bg-cream-warm',
};

const sizes = {
  sm: 'px-5 py-2.5',
  md: 'px-8 py-3.5',
  lg: 'px-12 py-4',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  as: Tag = 'button',
  ...props
}) {
  const base = `inline-flex items-center justify-center gap-2 transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </motion.button>
  );
}
