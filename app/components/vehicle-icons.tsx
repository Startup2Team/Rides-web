export function CarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </svg>
  );
}

export function MotoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M14 6h2l1 5-3 3M9 17l3-6L9 6" />
    </svg>
  );
}

// Detailed cruiser-style silhouette for map markers and larger placements.
export function MotoDetailedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" fill="currentColor" className={className} aria-hidden>
      {/* Rear wheel */}
      <circle cx="12" cy="30" r="8" />
      <circle cx="12" cy="30" r="3" fill="white" />
      <circle cx="12" cy="30" r="1" />
      {/* Front wheel */}
      <circle cx="52" cy="30" r="8" />
      <circle cx="52" cy="30" r="3" fill="white" />
      <circle cx="52" cy="30" r="1" />
      {/* Fender — rear */}
      <path d="M 4 26 Q 12 16, 20 26 L 18 28 Q 12 20, 6 28 Z" />
      {/* Fender — front */}
      <path d="M 44 26 Q 52 16, 60 26 L 58 28 Q 52 20, 46 28 Z" />
      {/* Engine block / mid frame */}
      <path d="M 20 24 L 24 18 L 40 18 L 44 24 L 42 28 L 22 28 Z" />
      {/* Fuel tank */}
      <path d="M 24 16 Q 28 11, 36 11 Q 40 11, 42 16 L 40 18 L 26 18 Z" />
      {/* Seat */}
      <path d="M 18 16 L 26 14 L 26 17 L 20 18 Z" />
      {/* Handlebar riser */}
      <rect x="40.5" y="9" width="2" height="6" rx="0.6" />
      {/* Handlebar */}
      <path d="M 38 9 L 46 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Mirror */}
      <circle cx="46" cy="6" r="1.2" />
      {/* Headlight */}
      <circle cx="44" cy="17" r="2" />
      <circle cx="44" cy="17" r="0.9" fill="white" />
      {/* Exhaust pipe */}
      <path d="M 22 26 L 14 28 L 14 30 L 22 28 Z" />
    </svg>
  );
}

export function FusoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="1" y="9" width="13" height="8" rx="1" />
      <path d="M14 12h5l3 3v2h-8" />
      <circle cx="6" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  );
}

export function HiluxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M2 17V12l3-4h7l2 3" />
      <path d="M14 11h6v6" />
      <path d="M2 17h18" />
      <circle cx="6" cy="17" r="1.5" />
      <circle cx="17" cy="17" r="1.5" />
    </svg>
  );
}
