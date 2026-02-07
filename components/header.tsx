"use client";

import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const BASE_NAV_ITEMS = [
  { id: "overview", label: "Overview", href: "/", icon: LayoutDashboard },
  { id: "news", label: "News", href: "/news", icon: Newspaper },
  {
    id: "watchlist",
    label: "Watchlist",
    href: "/watchlist",
    icon: Eye,
    flagKey: "watchlist",
  },
  {
    id: "research",
    label: "Research",
    href: "/research",
    icon: FlaskConical,
    flagKey: "research",
  },
  {
    id: "earnings",
    label: "Earnings",
    href: "/earnings",
    icon: CalendarDays,
    flagKey: "earnings",
  },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings },
];

export function V2Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  // Get feature flags
  const watchlistEnabled = useQuery(api.flags.getFlag, {
    key: "watchlist",
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
  });
  const researchEnabled = useQuery(api.flags.getFlag, {
    key: "research",
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
  });
  const earningsEnabled = useQuery(api.flags.getFlag, {
    key: "earnings",
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
  });
  const searchEnabled = useQuery(api.flags.getFlag, {
    key: "search",
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
  });
  const notificationsEnabled = useQuery(api.flags.getFlag, {
    key: "notifications",
    userEmail: user?.emailAddresses?.[0]?.emailAddress,
  });

  // Filter navigation items based on feature flags
  const NAV_ITEMS = BASE_NAV_ITEMS.filter((item) => {
    if (item.flagKey === "watchlist") return watchlistEnabled;
    if (item.flagKey === "research") return researchEnabled;
    if (item.flagKey === "earnings") return earningsEnabled;
    return true; // Always show items without flagKey
  });

  const getActiveId = () => {
    if (pathname === "/") return "overview";
    const match = NAV_ITEMS.find(
      (item) => item.href !== "/" && pathname.startsWith(item.href),
    );
    return match?.id || "overview";
  };

  const activeId = getActiveId();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          background: "rgba(9,9,11,0.92)",
        }}
      >
        <div className="max-w-[1600px] mx-auto flex items-center">
          {/* Mobile Layout */}
          <div className="flex md:hidden items-center justify-between w-full px-4 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-sm font-semibold text-white tracking-tight">
                PulsePortfolio
              </span>
            </Link>

            {/* Mobile Right Section */}
            <div className="flex items-center gap-1">
              {searchEnabled && (
                <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              )}
              {notificationsEnabled && (
                <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </button>
              )}
              <div className="ml-1">
                <UserButton
                  appearance={{
                    elements: { userButtonAvatarBox: "w-7 h-7" },
                    baseTheme: dark,
                  }}
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors ml-1"
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center w-full">
            {/* Logo */}
            <div
              className="flex items-center px-6 py-3 shrink-0 border-r"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <Link href="/" className="flex items-center">
                <span className="text-sm font-semibold text-white tracking-tight">
                  PulsePortfolio
                </span>
              </Link>
            </div>

            {/* Nav Items - Ticker Style */}
            <div className="flex items-center">
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
              {searchEnabled && (
                <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors">
                  <Search className="h-3.5 w-3.5" />
                </button>
              )}
              {notificationsEnabled && (
                <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors relative">
                  <Bell className="h-3.5 w-3.5" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </button>
              )}
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
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeId === item.id;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="block"
                  >
                    <div
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-white/[0.08] text-white"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
}
