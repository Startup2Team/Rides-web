type Props = {
  size?: number;
  className?: string;
  alt?: string;
  /** kept for API compatibility with the old next/image logo; unused for inline SVG */
  priority?: boolean;
};

/**
 * Rides mark — an open route/orbit ring with a forward chevron and a single blue
 * node, suggesting motion along a path. Monochrome (inherits `currentColor` for
 * the ring + chevron) with one blue accent node — fits the Swiss editorial system.
 */
export function RidesLogo({ size, className = "", alt = "Rides" }: Props) {
  const style =
    size !== undefined && !/[hw]-/.test(className)
      ? { width: size, height: size }
      : undefined;

  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={alt}
      className={className}
      style={style}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* open route / orbit ring */}
      <path d="M37.5 13.5A17 17 0 1 0 41 24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* forward chevron — direction of travel */}
      <path d="M19 17l8 7-8 7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      {/* moving node */}
      <circle cx="40.5" cy="11.5" r="4.5" fill="#0a66ff" />
    </svg>
  );
}
