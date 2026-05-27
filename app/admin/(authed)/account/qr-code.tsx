"use client";

import { useMemo } from "react";

export function QRCode({ seed, size = 25 }: { seed: string; size?: number }) {
  const cells = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    const rand = () => {
      h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
      h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
      h = (h ^ (h >>> 16)) >>> 0;
      return h / 4294967295;
    };

    const grid: boolean[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => rand() > 0.5),
    );

    const drawFinder = (sx: number, sy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const onEdge = x === 0 || x === 6 || y === 0 || y === 6;
          const center = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[sy + y][sx + x] = onEdge || center;
        }
      }
      for (let y = -1; y <= 7; y++) {
        for (let x = -1; x <= 7; x++) {
          if (
            (x === -1 || x === 7 || y === -1 || y === 7) &&
            sx + x >= 0 &&
            sx + x < size &&
            sy + y >= 0 &&
            sy + y < size
          ) {
            grid[sy + y][sx + x] = false;
          }
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(size - 7, 0);
    drawFinder(0, size - 7);

    return grid;
  }, [seed, size]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="h-40 w-40"
      shapeRendering="crispEdges"
      aria-hidden
    >
      <rect width={size} height={size} fill="white" />
      {cells.map((row, y) =>
        row.map((on, x) =>
          on ? (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0f172a" />
          ) : null,
        ),
      )}
    </svg>
  );
}
