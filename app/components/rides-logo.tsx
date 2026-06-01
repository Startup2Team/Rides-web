import Image from "next/image";

type Props = {
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
};

// Pass `size` for a fixed pixel size, or pass Tailwind size classes via
// `className` (e.g. "h-12 w-12 sm:h-16 sm:w-16") for responsive sizing.
export function RidesLogo({
  size,
  className = "",
  alt = "Rides",
  priority = false,
}: Props) {
  const intrinsic = (size ?? 120) * 2;
  return (
    <Image
      src="/rideslogo.png"
      alt={alt}
      width={intrinsic}
      height={intrinsic}
      priority={priority}
      className={`object-contain ${className}`}
      style={size !== undefined && !/[hw]-/.test(className) ? { width: size, height: size } : undefined}
    />
  );
}
