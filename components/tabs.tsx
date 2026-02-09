"use client";

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
  return (
    <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-stretch">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const isFirst = index === 0;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative ${index < tabs.length - 1 ? "border-r" : ""}`}
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
