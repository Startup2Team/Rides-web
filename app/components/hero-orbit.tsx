"use client";

import { useEffect, useRef } from "react";

const RING_COUNT = 24;
const RINGS = Array.from({ length: RING_COUNT }, (_, i) => i * (360 / RING_COUNT));

// Rotation speed, in degrees per frame at 60fps.
// 0.9 deg/frame ≈ 7s per full turn — clearly rotating, not dizzying.
const SPIN_SPEED = 0.9;
const STOPPED = 0;
const EASE = 0.08; // smooth start / smooth stop

type Props = {
  className?: string;
};

export function HeroOrbit({ className }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rotationRef = useRef(0);
  const currentSpeedRef = useRef(0);
  const targetSpeedRef = useRef(STOPPED);

  useEffect(() => {
    // Respect users who prefer no motion — render at baseline, no animation.
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let raf = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.6667, 4);
      lastTime = now;

      // Smoothly approach target — no jarring snap on enter/leave.
      currentSpeedRef.current +=
        (targetSpeedRef.current - currentSpeedRef.current) * EASE;

      rotationRef.current += currentSpeedRef.current * dt;
      if (svgRef.current) {
        svgRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={className}
      // Make the hit area a circle that matches the visible ring sphere.
      // Square bounding boxes triggered hover in the empty corners.
      style={{ clipPath: "circle(50%)" }}
      onPointerEnter={() => {
        targetSpeedRef.current = SPIN_SPEED;
      }}
      onPointerLeave={() => {
        targetSpeedRef.current = STOPPED;
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 320 320"
        aria-hidden
        className="h-full w-full"
        style={{ willChange: "transform" }}
      >
        {RINGS.map((deg, i) => (
          <ellipse
            key={i}
            cx="160"
            cy="160"
            rx="140"
            ry="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            transform={`rotate(${deg} 160 160)`}
          />
        ))}
      </svg>
    </div>
  );
}
