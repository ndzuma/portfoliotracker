"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/* ========================================================================== */
/*  SPARKLINE                                                                  */
/* ========================================================================== */

function Sparkline({
  up,
  className = "",
}: {
  up: boolean;
  className?: string;
}) {
  const points = up
    ? "0,20 10,18 20,22 30,15 40,17 50,12 60,14 70,8 80,7"
    : "0,5 10,8 20,4 30,10 40,12 50,18 60,13 70,20 80,22";
  return (
    <svg viewBox="0 0 80 25" className={className} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={up ? "#22c55e" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ========================================================================== */
/*  TYPES                                                                      */
/* ========================================================================== */

interface Benchmark {
  name: string;
  ticker: string;
  close: number;
  percentageChange: number;
}

interface V2MovingTickerProps {
  benchmarks: Benchmark[];
  /** Pixels per second — controls scroll speed. Default: 40 */
  speed?: number;
}

/* ========================================================================== */
/*  SINGLE TICKER CELL                                                         */
/* ========================================================================== */

function TickerCell({ b }: { b: Benchmark }) {
  const isPositive = b.percentageChange >= 0;
  return (
    <div
      className="flex items-center gap-4 px-6 py-3 shrink-0 border-r"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="select-none">
        <p className="text-xs text-zinc-600 font-medium leading-none mb-0.5">
          {b.ticker}
        </p>
        <p className="text-sm text-white font-semibold tabular-nums leading-tight">
          {b.close.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
      <Sparkline up={isPositive} className="w-16 h-6" />
      <span
        className={`text-xs font-semibold tabular-nums select-none ${
          isPositive ? "text-emerald-500" : "text-red-500"
        }`}
      >
        {isPositive ? "+" : ""}
        {b.percentageChange.toFixed(2)}%
      </span>
    </div>
  );
}

/* ========================================================================== */
/*  MOVING TICKER                                                              */
/*                                                                             */
/*  Dynamically repeats items so one "set" always exceeds the container        */
/*  width. Duplicates that set for a seamless CSS infinite scroll loop.        */
/*  Recalculates on resize via ResizeObserver.                                 */
/* ========================================================================== */

export function V2MovingTicker({
  benchmarks,
  speed = 40,
}: V2MovingTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [reps, setReps] = useState(1);
  const [duration, setDuration] = useState(30);
  const [isPaused, setIsPaused] = useState(false);
  const [measured, setMeasured] = useState(false);

  /**
   * Measure a single natural set of items and the container width,
   * then figure out how many repetitions we need so one "set" is
   * always wider than the viewport. This prevents any gap.
   */
  const recalc = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const containerW = container.offsetWidth;
    const singleSetW = measure.scrollWidth;

    if (singleSetW <= 0 || containerW <= 0) return;

    // Need enough reps so that one set > container width.
    // +1 extra to guarantee overlap beyond the edge.
    const needed = Math.ceil(containerW / singleSetW) + 1;
    setReps(needed);
    setMeasured(true);
  }, []);

  /**
   * Once reps are set and the track is rendered, measure the actual
   * half-width of the track (one repeated set) and derive animation
   * duration from it so scroll speed is visually consistent.
   */
  useEffect(() => {
    if (!measured || !trackRef.current) return;
    const halfWidth = trackRef.current.scrollWidth / 2;
    if (halfWidth > 0 && speed > 0) {
      setDuration(halfWidth / speed);
    }
  }, [reps, measured, speed, benchmarks]);

  /* Initial measurement + ResizeObserver for responsive recalc */
  useEffect(() => {
    recalc();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => recalc());
    observer.observe(container);
    return () => observer.disconnect();
  }, [recalc, benchmarks]);

  if (benchmarks.length === 0) return null;

  /* Build one "set" = benchmarks × reps */
  const renderSet = (keyPrefix: string) => {
    const cells: React.ReactNode[] = [];
    for (let r = 0; r < reps; r++) {
      for (let i = 0; i < benchmarks.length; i++) {
        cells.push(
          <TickerCell
            key={`${keyPrefix}-${r}-${benchmarks[i].ticker}-${i}`}
            b={benchmarks[i]}
          />,
        );
      }
    }
    return cells;
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden border-b"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        /* Edge fade masks — cinematic fade to transparent at both edges */
        maskImage:
          "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gold accent bottom border — subtle glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--primary, #d4af37) 30%, var(--primary, #d4af37) 70%, transparent 100%)",
          opacity: 0.25,
        }}
      />

      {/*
       * Hidden measurement div — renders one natural set of items
       * off-screen so we can measure its width without it being
       * visible. position:absolute so it doesn't affect layout.
       */}
      <div
        ref={measureRef}
        className="flex items-center absolute invisible pointer-events-none"
        style={{ position: "absolute", top: 0, left: 0 }}
        aria-hidden="true"
      >
        {benchmarks.map((b, i) => (
          <TickerCell key={`measure-${b.ticker}-${i}`} b={b} />
        ))}
      </div>

      {/* Scrolling track — two identical sets for seamless loop */}
      <div
        ref={trackRef}
        className="flex items-center w-max"
        style={{
          animationName: "ticker-scroll",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {/* Set A */}
        <div className="flex items-center shrink-0">{renderSet("a")}</div>
        {/* Set B — duplicate for seamless loop */}
        <div className="flex items-center shrink-0" aria-hidden="true">
          {renderSet("b")}
        </div>
      </div>
    </div>
  );
}
