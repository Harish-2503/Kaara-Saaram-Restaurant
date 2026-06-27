const variants = {
  spicy:     'bg-red-900/40 text-red-300 border border-red-800/40',
  veg:       'bg-green-900/30 text-green-400 border border-green-800/40',
  signature: 'bg-gold-dark/20 text-gold border border-gold/30',
  tag:       'bg-white/5 text-cream-text border border-white/10',
};

export default function Badge({ children, variant = 'tag', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-xs font-body tracking-wider ${variants[variant]} ${className}`}>
      {variant === 'veg' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />}
      {variant === 'spicy' && <span className="text-[10px]">🌶</span>}
      {children}
    </span>
  );
}
