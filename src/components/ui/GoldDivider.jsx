export default function GoldDivider({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold opacity-40" />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gold opacity-70 shrink-0">
        <path d="M10 2L12.5 7.5L18 8.5L14 12.5L15 18L10 15.5L5 18L6 12.5L2 8.5L7.5 7.5L10 2Z" fill="currentColor" />
      </svg>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold opacity-40" />
    </div>
  );
}
