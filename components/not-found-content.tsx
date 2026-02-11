"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { House, ArrowLeft, Compass } from "@phosphor-icons/react";

const GLITCH_CHARS = "░▒▓█▀▄▐▌▊▎▏┃━┓┗┛┏╋╳⬡⎔◇◆";

function useGlitchText(original: string, active: boolean) {
  const [text, setText] = useState(original);

  useEffect(() => {
    if (!active) {
      setText(original);
      return;
    }

    let frame = 0;
    const maxFrames = 12;

    const interval = setInterval(() => {
      frame++;
      if (frame >= maxFrames) {
        setText(original);
        clearInterval(interval);
        return;
      }

      const glitched = original
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < (frame / maxFrames) * original.length) return char;
          return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        })
        .join("");

      setText(glitched);
    }, 60);

    return () => clearInterval(interval);
  }, [original, active]);

  return text;
}

export function NotFoundContent() {
  const [mounted, setMounted] = useState(false);
  const glitchedTitle = useGlitchText("404", mounted);
  const glitchedSub = useGlitchText("PAGE NOT FOUND", mounted);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#09090b" }}
    >
      {/* Ambient grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212, 175, 55, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 175, 55, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow behind the 404 */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      {mounted ? (
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* 404 — monospace glitch reveal */}
          <motion.h1
            className="font-mono text-[clamp(80px,20vw,180px)] font-black leading-none tracking-tighter select-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "2px rgba(212, 175, 55, 0.5)",
              textShadow: "0 0 80px rgba(212, 175, 55, 0.1)",
            }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              delay: 0.1,
            }}
          >
            {glitchedTitle}
          </motion.h1>

          {/* Subtitle — monospace, staggered in */}
          <motion.p
            className="font-mono text-xs tracking-[0.35em] text-zinc-600 mt-4 uppercase"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            {glitchedSub}
          </motion.p>

          {/* Divider — gold gradient line */}
          <motion.div
            className="w-16 h-px mt-8 mb-8"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.4) 50%, transparent 100%)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          />

          {/* Description */}
          <motion.p
            className="text-sm text-zinc-600 max-w-sm leading-relaxed"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            This route doesn&apos;t exist or you don&apos;t have access.
            <br />
            The page may have moved, or the feature isn&apos;t available yet.
          </motion.p>

          {/* Navigation actions */}
          <motion.div
            className="flex items-center gap-3 mt-10"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.4 }}
          >
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              <House className="h-4 w-4" />
              Dashboard
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
          </motion.div>

          {/* Status indicator */}
          <motion.div
            className="flex items-center gap-2 mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500/40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500/60" />
            </div>
            <span className="font-mono text-[10px] text-zinc-700 uppercase tracking-[0.2em]">
              PulsePortfolio — Route Not Resolved
            </span>
          </motion.div>
        </motion.div>
      ) : (
        /* SSR-safe static fallback — identical layout, no motion/glitch */
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <h1
            className="font-mono text-[clamp(80px,20vw,180px)] font-black leading-none tracking-tighter select-none"
            style={{
              color: "transparent",
              WebkitTextStroke: "2px rgba(212, 175, 55, 0.5)",
              textShadow: "0 0 80px rgba(212, 175, 55, 0.1)",
            }}
          >
            404
          </h1>
          <p className="font-mono text-xs tracking-[0.35em] text-zinc-600 mt-4 uppercase">
            PAGE NOT FOUND
          </p>
          <div
            className="w-16 h-px mt-8 mb-8"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.4) 50%, transparent 100%)",
            }}
          />
          <p className="text-sm text-zinc-600 max-w-sm leading-relaxed">
            This route doesn&apos;t exist or you don&apos;t have access.
            <br />
            The page may have moved, or the feature isn&apos;t available yet.
          </p>
          <div className="flex items-center gap-3 mt-10">
            <Link
              href="/"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Floating compass icon — subtle ambient decoration */}
      <div className="absolute bottom-8 right-8 text-zinc-900">
        <Compass className="h-24 w-24" weight="thin" />
      </div>
    </div>
  );
}
