"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Bell,
  Newspaper,
  Eye,
  FlaskConical,
  CalendarDays,
  Settings,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", href: "/v2", icon: LayoutDashboard },
  { id: "news", label: "News", href: "/v2/news", icon: Newspaper },
  { id: "watchlist", label: "Watchlist", href: "/v2/watchlist", icon: Eye },
  {
    id: "research",
    label: "Research",
    href: "/v2/research",
    icon: FlaskConical,
  },
  {
    id: "earnings",
    label: "Earnings",
    href: "/v2/earnings",
    icon: CalendarDays,
  },
  { id: "settings", label: "Settings", href: "/v2/settings", icon: Settings },
];

export function V2Header() {
  const pathname = usePathname();

  const getActiveId = () => {
    if (pathname === "/v2") return "overview";
    const match = NAV_ITEMS.find(
      (item) => item.href !== "/v2" && pathname.startsWith(item.href),
    );
    return match?.id || "overview";
  };

  const activeId = getActiveId();

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background: "rgba(9,9,11,0.92)",
      }}
    >
      <div className="max-w-[1600px] mx-auto flex items-center overflow-x-auto">
        {/* Logo */}
        <div
          className="flex items-center px-6 py-3 shrink-0 border-r"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <Link href="/v2" className="flex items-center">
            <span className="text-sm font-semibold text-white tracking-tight">
              PulsePortfolio
            </span>
          </Link>
        </div>

        {/* Nav Items - Ticker Style */}
        <div className="hidden md:flex items-center">
          {NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeId === item.id;
            return (
              <div
                key={item.id}
                className={`flex items-center ${index < NAV_ITEMS.length - 1 ? "border-r" : ""}`}
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <Link href={item.href} className="block">
                  <div
                    className={`flex items-center gap-2 px-4 py-3 transition-all hover:bg-white/[0.04] ${
                      isActive
                        ? "bg-white/[0.06] text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-xs font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Right Section */}
        <div className="flex items-center ml-auto px-4 py-3 gap-1">
          <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors">
            <Search className="h-3.5 w-3.5" />
          </button>
          <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors relative">
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>
          <div className="ml-2">
            <UserButton
              appearance={{
                elements: { userButtonAvatarBox: "w-6 h-6" },
                baseTheme: dark,
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
