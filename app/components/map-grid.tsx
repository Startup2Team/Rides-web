"use client";

import { useEffect, useRef } from "react";

export function MapGrid() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    path.style.transition = "none";

    let start: number | null = null;
    const duration = 3000;

    function animate(ts: number) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      path!.style.strokeDashoffset = `${length * (1 - progress)}`;
      if (progress < 1) requestAnimationFrame(animate);
      else {
        // loop after pause
        setTimeout(() => {
          start = null;
          path!.style.strokeDashoffset = `${length}`;
          requestAnimationFrame(animate);
        }, 1200);
      }
    }

    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <svg
        viewBox="0 0 500 500"
        className="h-full w-full"
        aria-hidden
      >
        {/* ── Grid lines ── */}
        <g stroke="#e0e0e0" strokeWidth="1" opacity="0.6">
          {/* Vertical */}
          {[50, 100, 150, 200, 250, 300, 350, 400, 450].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" />
          ))}
          {/* Horizontal */}
          {[50, 100, 150, 200, 250, 300, 350, 400, 450].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="500" y2={y} />
          ))}
        </g>

        {/* ── Road highlights (thicker streets) ── */}
        <g stroke="#d0d0d0" strokeWidth="2.5" opacity="0.8">
          <line x1="150" y1="0" x2="150" y2="500" />
          <line x1="350" y1="0" x2="350" y2="500" />
          <line x1="0" y1="150" x2="500" y2="150" />
          <line x1="0" y1="350" x2="500" y2="350" />
        </g>

        {/* ── Blocks (subtle filled rects) ── */}
        <g fill="#f0f0f0" opacity="0.5">
          <rect x="52" y="52" width="96" height="96" rx="4" />
          <rect x="202" y="52" width="96" height="96" rx="4" />
          <rect x="352" y="52" width="96" height="96" rx="4" />
          <rect x="52" y="202" width="96" height="96" rx="4" />
          <rect x="352" y="202" width="96" height="96" rx="4" />
          <rect x="52" y="352" width="96" height="96" rx="4" />
          <rect x="202" y="352" width="96" height="96" rx="4" />
          <rect x="352" y="352" width="96" height="96" rx="4" />
        </g>

        {/* ── Animated route ── */}
        {/* Glow layer */}
        <path
          d="M 100 400 L 100 350 L 150 350 L 150 250 L 250 250 L 250 150 L 350 150 L 350 100 L 400 100"
          fill="none"
          stroke="#007aff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.15"
        />
        {/* Main route */}
        <path
          ref={pathRef}
          d="M 100 400 L 100 350 L 150 350 L 150 250 L 250 250 L 250 150 L 350 150 L 350 100 L 400 100"
          fill="none"
          stroke="#007aff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* ── Start pin ── */}
        <circle cx="100" cy="400" r="6" fill="#007aff" opacity="0.9" />
        <circle cx="100" cy="400" r="12" fill="#007aff" opacity="0.2" />

        {/* ── End destination pin ── */}
        <g>
          {/* Pulse rings */}
          <circle cx="400" cy="100" r="18" fill="#007aff" opacity="0.08">
            <animate attributeName="r" values="12;22;12" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="100" r="8" fill="#007aff" opacity="0.9" />
          <circle cx="400" cy="100" r="4" fill="white" />
        </g>

        {/* ── Moving car dot along route ── */}
        <circle r="5" fill="#007aff" stroke="white" strokeWidth="2">
          <animateMotion
            dur="3s"
            repeatCount="indefinite"
            path="M 100 400 L 100 350 L 150 350 L 150 250 L 250 250 L 250 150 L 350 150 L 350 100 L 400 100"
          />
        </circle>

        {/* ── Intersection dots ── */}
        {[
          [150, 350], [150, 250], [250, 250], [250, 150], [350, 150], [350, 100],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill="#007aff" opacity="0.3" />
        ))}

        {/* ── Street labels ── */}
        <g fill="#a0a0a0" fontSize="9" fontFamily="sans-serif" fontWeight="600">
          <text x="155" y="148" transform="rotate(-90 155 148)">KG 12 AVE</text>
          <text x="255" y="148" transform="rotate(-90 255 148)">KG 24 AVE</text>
          <text x="355" y="148" transform="rotate(-90 355 148)">KG 36 AVE</text>
          <text x="10" y="148">KG 11 ST</text>
          <text x="10" y="248">KG 22 ST</text>
          <text x="10" y="348">KG 33 ST</text>
        </g>
      </svg>

      {/* Fade edges */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,transparent_40%,var(--background)_100%)]" />
    </div>
  );
}
