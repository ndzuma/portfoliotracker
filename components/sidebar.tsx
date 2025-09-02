"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Newspaper,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Briefcase },
  { name: "News", href: "/dashboard/news", icon: Newspaper },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div
      className={`bg-[radial-gradient(circle_at_bottom_right,_#8d745d10_0%,_transparent_40%)] border-r border-[#8d745d]/30 ${collapsed ? "w-16" : "w-64"}`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-[#8d745d]/30">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <Image
                src="/pp-big.png"
                alt="Logo"
                width={150}
                height={150}
                className="object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8 p-0 text-primary hover:text-primary/80"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2.5">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-[#8d745d]/10 ${
                      isActive
                        ? "bg-[#8d745d]/15 text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : ""}`}
                    />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-[#8d745d]/30 min-h-18 ">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{ elements: { userButtonAvatarBox: "w-10 h-10" } }}
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.fullName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
