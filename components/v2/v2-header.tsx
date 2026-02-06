"use client";

import Link from "next/link";
import { Wallet, Search, Bell, Settings, Newspaper, TrendingUp, BookOpen, Calendar } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Button } from "@/components/ui/button";

interface V2HeaderProps {
  activeTab?: "overview" | "news" | "watchlist" | "research" | "earnings" | "settings";
}

export function V2Header({ activeTab = "overview" }: V2HeaderProps) {
  const navItems = [
    { id: "overview", label: "Overview", href: "/v2", icon: TrendingUp },
    { id: "news", label: "News", href: "/v2/news", icon: Newspaper },
    { id: "watchlist", label: "Watchlist", href: "/v2/watchlist", icon: BookOpen },
    { id: "research", label: "Research", href: "/v2/research", icon: Search },
    { id: "earnings", label: "Earnings", href: "/v2/earnings", icon: Calendar },
    { id: "settings", label: "Settings", href: "/v2/settings", icon: Settings },
  ];

  return (
    <nav className="sticky top-10 z-40 backdrop-blur-xl border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(9,9,11,0.9)" }}>
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-8 h-16">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/v2" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="h-4 w-4 text-black" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">Portfolio</span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <Link key={item.id} href={item.href}>
                  <button
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] h-9 w-9">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] relative h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          </Button>
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8",
              },
              baseTheme: dark,
            }}
          />
        </div>
      </div>
    </nav>
  );
}
