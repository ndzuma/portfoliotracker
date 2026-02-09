"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Accessible title (always rendered sr-only, plus optionally visible) */
  title: string;
  /** Optional step labels for the step indicator bar */
  steps?: string[];
  /** 0-indexed current step */
  currentStep?: number;
  /** Main dialog body */
  children: React.ReactNode;
  /** Footer slot — typically navigation/action buttons */
  footer?: React.ReactNode;
  /** Desktop max-width (default "460px") */
  maxWidth?: string;
}

const MOBILE_BREAKPOINT = 768;

export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  steps,
  currentStep = 0,
  children,
  footer,
  maxWidth = "460px",
}: ResponsiveDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef(0);

  // Mount guard for SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // Responsive breakpoint detection
  useEffect(() => {
    if (!mounted) return;
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(e.matches);
    handler(mql);
    mql.addEventListener("change", handler as (e: MediaQueryListEvent) => void);
    return () =>
      mql.removeEventListener(
        "change",
        handler as (e: MediaQueryListEvent) => void,
      );
  }, [mounted]);

  // Lock body scroll when open
  useEffect(() => {
    if (!mounted) return;
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [open, mounted]);

  // Escape key handler
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, handleEscape]);

  // Focus trap — focus the dialog content on open
  useEffect(() => {
    if (open && contentRef.current) {
      const focusable = contentRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }
  }, [open, currentStep]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onOpenChange(false);
  };

  // Drag-to-dismiss for mobile bottom sheet
  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStartY.current = clientY;
  };

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (dragStartY.current === null) return;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragCurrentY.current = Math.max(0, clientY - dragStartY.current);
    if (contentRef.current) {
      contentRef.current.style.transform = `translateY(${dragCurrentY.current}px)`;
    }
  };

  const handleDragEnd = () => {
    if (dragCurrentY.current > 120) {
      onOpenChange(false);
    }
    if (contentRef.current) {
      contentRef.current.style.transform = "";
    }
    dragStartY.current = null;
    dragCurrentY.current = 0;
  };

  if (!mounted) return null;

  // ─── Step Indicator ────────────────────────────────────────────
  const stepIndicator =
    steps && steps.length > 0 ? (
      <div className="flex items-stretch border-b border-white/[0.06] relative">
        {steps.map((label, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          return (
            <div
              key={label}
              className="flex-1 relative flex items-center justify-center"
            >
              <div
                className={`w-full py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 select-none ${
                  isActive
                    ? "text-white"
                    : isDone
                      ? "text-zinc-500"
                      : "text-zinc-700"
                }`}
              >
                {label}
              </div>
              {/* Gold accent underline on active step — ticker-strip DNA */}
              {isActive && (
                <motion.div
                  layoutId="responsive-dialog-step-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, var(--primary) 20%, var(--primary) 80%, transparent 100%)",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 35,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    ) : null;

  // ─── Render ────────────────────────────────────────────────────
  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop — reduced blur per design rules */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />

          {isMobile ? (
            /* ─── Mobile Bottom Sheet ─────────────────────────── */
            <motion.div
              ref={contentRef}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className="relative z-10 w-full max-h-[90vh] bg-zinc-950 border-t border-white/[0.08] rounded-t-2xl shadow-2xl flex flex-col will-change-transform"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 34,
                mass: 0.8,
              }}
            >
              {/* Drag handle */}
              <div
                className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseUp={handleDragEnd}
              >
                <div className="w-9 h-[3px] rounded-full bg-zinc-700" />
              </div>

              {/* sr-only title */}
              <span className="sr-only">{title}</span>

              {/* Step indicator */}
              {stepIndicator}

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-2">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 pb-6 pt-3 border-t border-white/[0.06]">
                  {footer}
                </div>
              )}
            </motion.div>
          ) : (
            /* ─── Desktop Centered Modal ──────────────────────── */
            <motion.div
              ref={contentRef}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className="relative z-10 bg-zinc-950 border border-white/[0.08] rounded-xl shadow-2xl w-full overflow-hidden flex flex-col"
              style={{ maxWidth, maxHeight: "85vh" }}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 32,
                mass: 0.7,
              }}
            >
              {/* sr-only title */}
              <span className="sr-only">{title}</span>

              {/* Step indicator */}
              {stepIndicator}

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-2">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              {footer && (
                <div className="px-6 pb-6 pt-3 border-t border-white/[0.06]">
                  {footer}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
