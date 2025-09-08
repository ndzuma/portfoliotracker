"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  Newspaper,
  Settings,
  CalendarDaysIcon,
  BookmarkIcon,
  BinocularsIcon,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { isFeatureEnabled } from "@/lib/featureFlags"

const getNavigation = () => {
  const baseNavigation = [
    { name: "Dashboard", href: "/", icon: Briefcase },
    { name: "News", href: "/news", icon: Newspaper },
  ];

  const conditionalNavigation = [
    ...(isFeatureEnabled('watchlist') ? [{ name: "Watchlist", href: "/watchlist", icon: BookmarkIcon }] : []),
    ...(isFeatureEnabled('research') ? [{ name: "Research", href: "/research", icon: BinocularsIcon }] : []),
    ...(isFeatureEnabled('earningsCalendar') ? [{ name: "Earnings", href: "/earnings", icon: CalendarDaysIcon }] : []),
  ];

  return [
    ...baseNavigation,
    ...conditionalNavigation,
    { name: "Settings", href: "/settings", icon: Settings },
  ];
};

export function NavMain() {
  const pathname = usePathname()
  const navigation = getNavigation()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.name}
                isActive={isActive}
                className={`
                  transition-colors hover:bg-[#8d745d]/10 
                  ${isActive 
                    ? "bg-[#8d745d]/15 text-[#8d745d] hover:bg-[#8d745d]/20" 
                    : "text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <Link href={item.href}>
                  <item.icon className={`h-4 w-4 ${isActive ? "text-[#8d745d]" : ""}`} />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}