import type { ReactNode } from "react";

type IphoneMockupProps = {
  label: string;
  tiltDeg?: number;
  floatDelay?: string;
  className?: string;
  /**
   * Hide the mockup's Dynamic Island. Use when `children` is a real
   * screenshot that already includes its own iOS status bar / notch area,
   * so the two top bars don't collide.
   */
  hideIsland?: boolean;
  flat?: boolean;
  children?: ReactNode;
};

/**
 * iPhone 16 Pro front-view mockup. Renders a high-fidelity titanium-white
 * device with proper Dynamic Island, thin uniform bezels, Action button,
 * volume buttons, Side button and Camera Control. Pass `children` for screen
 * content; empty falls back to a "label" placeholder.
 */
export function IphoneMockup({
  label,
  tiltDeg = 0,
  floatDelay = "0s",
  className = "",
  hideIsland = false,
  flat = false,
  children,
}: IphoneMockupProps) {
  return (
    <div
      className={`relative ${flat ? "" : "iphone-float"} ${className}`}
      style={flat ? undefined : {
        transform: `perspective(1400px) rotateY(${tiltDeg}deg) rotateX(7deg)`,
        transformStyle: "preserve-3d",
        animationDelay: floatDelay,
      }}
    >
      {/* Float keyframes + reduced-motion guard */}
      <style>{`
        @keyframes iphone-float-bob {
          0%, 100% { translate: 0 0; }
          50%      { translate: 0 -10px; }
        }
        .iphone-float {
          animation: iphone-float-bob 5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .iphone-float { animation: none; }
        }
      `}</style>
      {/* Outer black titanium chassis */}
      <div
        className="relative aspect-[9/19.5] w-[210px]"
        style={{
          borderRadius: "42px",
          background:
            "linear-gradient(145deg, #3a3d46 0%, #1a1c22 22%, #0d0f14 50%, #1a1c22 78%, #3a3d46 100%)",
          padding: "6px",
          boxShadow: [
            // Big soft cast — light from top-left
            "30px 60px 80px -25px rgba(0,0,0,0.55)",
            "15px 30px 50px -18px rgba(0,0,0,0.35)",
            // Close grounded shadow
            "0 8px 16px -6px rgba(0,0,0,0.3)",
            // Top highlight (subtle silver where light catches the chamfered top edge)
            "inset 0 1.5px 0 rgba(180,190,210,0.55)",
            // Bottom dark line (chassis underside)
            "inset 0 -2px 0 rgba(0,0,0,0.7)",
            // Left edge highlight (lit side, muted silver)
            "inset 2px 0 0 rgba(150,160,180,0.35)",
            // Right edge shadow (dark side facing away)
            "inset -2px 0 0 rgba(0,0,0,0.5)",
            // Outline so it stands out
            "0 0 0 0.5px rgba(255,255,255,0.06)",
          ].join(","),
        }}
      >
        {/* Chassis-to-screen chamfer ring (the dark gap where glass sits in the frame) */}
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            inset: "6px",
            borderRadius: "37px",
            boxShadow: [
              "inset 0 0 0 1.5px #000",
              "inset 0 0 0 2.5px #2a2d35",
              "inset 0 1px 0 3.5px rgba(180,190,210,0.25)",
            ].join(","),
          }}
        />
        {/* Inner black bezel (thin, uniform) */}
        <div
          className="relative h-full w-full bg-black"
          style={{ borderRadius: "36px", padding: "5px" }}
        >
          {/* Screen — frosted/translucent so the map shows through */}
          <div
            className="relative h-full w-full overflow-hidden backdrop-blur-md"
            style={{
              borderRadius: "31px",
              background:
                "linear-gradient(150deg, rgba(255,255,255,0.5) 0%, rgba(245,248,255,0.4) 50%, rgba(235,240,250,0.5) 100%)",
            }}
          >
            {/* Status bar text/icons — float over the app content. No background
                band. Subtle text shadow keeps them readable against any color. */}
            <div
              className="absolute inset-x-0 top-0 z-20 flex h-[30px] items-center px-3 text-zinc-900"
              style={{
                textShadow:
                  "0 0 4px rgba(255,255,255,0.6), 0 1px 0 rgba(255,255,255,0.4)",
              }}
            >
              {/* Left: time + nav arrow */}
              <div className="flex flex-1 items-center gap-1 pl-1">
                <span className="text-[9px] font-semibold leading-none tabular-nums tracking-tight">
                  9:41
                </span>
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-[8px] w-[8px]" aria-hidden>
                  <path d="M13.78 2.22a.75.75 0 0 1 .17.82l-4.5 10.5a.75.75 0 0 1-1.4-.05L6.6 9.4l-3.7-1.45a.75.75 0 0 1-.05-1.4l10.1-4.32a.75.75 0 0 1 .83.17z" />
                </svg>
              </div>
              {/* Center spacer for Dynamic Island */}
              <div className="w-[58px]" />
              {/* Right: signal + 5G + battery */}
              <div className="flex flex-1 items-center justify-end gap-1 pr-1">
                <svg viewBox="0 0 20 12" fill="currentColor" className="h-[9px]" aria-hidden>
                  <rect x="0" y="8" width="3.4" height="4" rx="0.8" />
                  <rect x="5.2" y="5.5" width="3.4" height="6.5" rx="0.8" />
                  <rect x="10.4" y="2.5" width="3.4" height="9.5" rx="0.8" />
                  <rect x="15.6" y="0" width="3.4" height="12" rx="0.8" />
                </svg>
                <span className="text-[8px] font-bold leading-none tracking-[-0.02em]">5G</span>
                <span aria-hidden className="relative flex items-center">
                  <span className="flex h-[10px] w-[18px] items-center justify-center rounded-[2.5px] bg-zinc-900 px-[1px]">
                    <span className="text-[6px] font-bold leading-none tabular-nums text-white">92</span>
                  </span>
                  <span className="ml-[1px] h-[3.5px] w-[1.5px] rounded-r-[1px] bg-zinc-900" />
                </span>
              </div>
            </div>

            {/* Dynamic Island — sits over the status bar */}
            {!hideIsland && (
              <div
                className="absolute left-1/2 top-[5px] z-30 flex h-[18px] w-[56px] -translate-x-1/2 items-center justify-between rounded-full bg-black px-[7px]"
                style={{
                  boxShadow:
                    "inset 0 0 0 0.5px rgba(255,255,255,0.05), 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                {/* Speaker dot */}
                <span className="block h-[3px] w-[3px] rounded-full bg-zinc-800" />
                {/* Front camera lens */}
                <span
                  className="block h-[5px] w-[5px] rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle at 30% 30%, #2a2a3a, #0a0a14 60%)",
                    boxShadow: "inset 0 0 0 0.5px rgba(255,255,255,0.08)",
                  }}
                />
              </div>
            )}

            {/* Screen content — fills the entire screen. The status bar sits ON TOP
                via a higher z-index, with its bottom edge fading into the screenshot. */}
            {children ?? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.28em]"
                    style={{ color: "rgba(40,60,90,0.55)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="mt-1.5 text-[11px]"
                    style={{ color: "rgba(40,60,90,0.4)" }}
                  >
                    Coming soon
                  </p>
                </div>
              </div>
            )}

            {/* Strong sweeping glare — sells the glass surface */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: [
                  "linear-gradient(115deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 18%, transparent 35%, transparent 65%, rgba(255,255,255,0.08) 88%, rgba(255,255,255,0.25) 100%)",
                ].join(","),
              }}
            />
            {/* Soft top reflection */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)",
              }}
            />
          </div>
        </div>

        {/* ─── Left side: Action button (small) + Volume up/down ─── */}
        <span
          aria-hidden
          className="absolute"
          style={{
            left: "-3px",
            top: "16%",
            width: "3px",
            height: "26px",
            borderRadius: "1.5px 0 0 1.5px",
            background: "linear-gradient(to right, #2a2d35, #16181d)",
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.4)",
          }}
        />
        <span
          aria-hidden
          className="absolute"
          style={{
            left: "-3px",
            top: "26%",
            width: "3px",
            height: "44px",
            borderRadius: "1.5px 0 0 1.5px",
            background: "linear-gradient(to right, #2a2d35, #16181d)",
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.4)",
          }}
        />
        <span
          aria-hidden
          className="absolute"
          style={{
            left: "-3px",
            top: "37%",
            width: "3px",
            height: "44px",
            borderRadius: "1.5px 0 0 1.5px",
            background: "linear-gradient(to right, #2a2d35, #16181d)",
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.4)",
          }}
        />

        {/* ─── Right side: Side button + Camera Control ─── */}
        <span
          aria-hidden
          className="absolute"
          style={{
            right: "-3px",
            top: "22%",
            width: "3px",
            height: "62px",
            borderRadius: "0 1.5px 1.5px 0",
            background: "linear-gradient(to left, #2a2d35, #16181d)",
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.4)",
          }}
        />
        <span
          aria-hidden
          className="absolute"
          style={{
            right: "-3px",
            top: "40%",
            width: "3px",
            height: "32px",
            borderRadius: "0 1.5px 1.5px 0",
            background: "linear-gradient(to left, #2a2d35, #16181d)",
            boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.4)",
          }}
        />

        {/* Titanium edge sheen */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: "42px",
            background:
              "linear-gradient(180deg, rgba(180,190,210,0.12) 0%, transparent 6%, transparent 94%, rgba(0,0,0,0.25) 100%)",
          }}
        />
      </div>
    </div>
  );
}
