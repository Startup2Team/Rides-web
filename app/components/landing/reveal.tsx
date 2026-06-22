"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** stagger in ms — sets the CSS reveal delay */
  delay?: number;
  /** render as a different element (default div) */
  as?: ElementType;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * Wraps content in a `.rides-reveal` element and adds `.is-in` the first time it
 * scrolls into view, triggering the fade/rise/de-blur transition defined in CSS.
 * Reveal-once (we unobserve after the first intersection). Zero dependencies.
 */
export default function Reveal({ children, delay = 0, as, className = "", style }: Props) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      ref={ref}
      className={`rides-reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms`, ...style } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
