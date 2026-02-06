"use client";

interface TabItem {
  id: string;
  label: string;
}

interface V2TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function V2Tabs({ tabs, activeTab, onTabChange }: V2TabsProps) {
  return (
    <div className="max-w-[1600px] mx-auto px-8 py-8">
      <div className="flex items-center gap-6 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-primary text-white"
                : "border-transparent text-zinc-500 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
