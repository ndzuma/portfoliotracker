"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";

interface TabItem {
  id: string;
  label: string;
}

interface V2TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const tabSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

export function V2Tabs({ tabs, activeTab, onTabChange }: V2TabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();

    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, tabs]);

  // Scroll active tab into view on mount / tab change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const activeEl = el.querySelector(`[data-tab-id="${activeTab}"]`);
    if (activeEl) {
      const rect = activeEl.getBoundingClientRect();
      const containerRect = el.getBoundingClientRect();

      if (rect.left < containerRect.left || rect.right > containerRect.right) {
        activeEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [activeTab]);

  return (
    <div
      className="border-b relative"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      {/* Left fade mask */}
      {canScrollLeft && (
        <div
          className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, #09090b 0%, transparent 100%)",
          }}
        />
      )}

      {/* Right fade mask */}
      {canScrollRight && (
        <div
          className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, #09090b 0%, transparent 100%)",
          }}
        />
      )}

      <div className="max-w-[1600px] mx-auto px-6">
        <div
          ref={scrollRef}
          className="flex items-stretch overflow-x-auto scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const isFirst = index === 0;

            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative shrink-0 ${index < tabs.length - 1 ? "border-r" : ""}`}
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <motion.div
                  className={`relative py-5 text-sm font-semibold whitespace-nowrap cursor-pointer ${isFirst ? "pl-0 pr-6" : "px-6"}`}
                  animate={{
                    color: isActive
                      ? "rgba(255,255,255,1)"
                      : "rgba(255,255,255,0.35)",
                  }}
                  whileHover={{
                    color: isActive
                      ? "rgba(255,255,255,1)"
                      : "rgba(255,255,255,0.7)",
                  }}
                  transition={{ duration: 0.15 }}
                >
                  {tab.label}

                  {/* Active indicator — gold underline, flush to border */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: "var(--primary)" }}
                      layoutId="tab-active-indicator"
                      transition={tabSpring}
                    />
                  )}
                </motion.div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
