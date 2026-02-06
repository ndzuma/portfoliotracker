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
  { id: "research", label: "Research", href: "/v2/research", icon: FlaskConical },
  { id: "earnings", label: "Earnings", href: "/v2/earnings", icon: CalendarDays },
  { id: "settings", label: "Settings", href: "/v2/settings", icon: Settings },
];

export function V2Header() {
  const pathname = usePathname();

  const getActiveId = () => {
    if (pathname === "/v2") return "overview";
    const match = NAV_ITEMS.find((item) => item.href !== "/v2" && pathname.startsWith(item.href));
    return match?.id || "overview";
  };

  const activeId = getActiveId();

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(9,9,11,0.92)" }}
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-8 h-14">
        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Link href="/v2" className="flex items-center gap-2.5 shrink-0">
            <span className="text-base font-semibold text-white tracking-tight">PulsePortfolio</span>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeId === item.id;
              return (
                <Link key={item.id} href={item.href}>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-white/[0.08] text-white"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors">
            <Search className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </button>
          <div className="ml-1">
            <UserButton
              appearance={{
                elements: { userButtonAvatarBox: "w-7 h-7" },
                baseTheme: dark,
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
