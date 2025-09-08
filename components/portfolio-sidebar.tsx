"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Briefcase,
  Newspaper,
  Settings,
  CalendarDaysIcon,
  BookmarkIcon,
  BinocularsIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Image from "next/image"
import { UserButton } from "@clerk/nextjs"
import { useUser } from "@clerk/nextjs"
import { dark } from '@clerk/themes'

import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
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

// get sign out url from env
const signedOutUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_OUT_URL || "/";

export function PortfolioSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user } = useUser()
  const navigation = getNavigation()
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar 
      collapsible="icon" 
      className="bg-[radial-gradient(circle_at_bottom_right,_#8d745d10_0%,_transparent_40%)] border-r border-[#8d745d]/30"
      {...props}
    >
      <SidebarHeader className="border-b border-[#8d745d]/30">
        <div className="flex items-center justify-between p-2">
          {!isCollapsed && (
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
            onClick={toggleSidebar}
            className="h-8 w-8 p-0 text-primary hover:text-primary/80 ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={isCollapsed ? item.name : undefined}
                      className={`
                        transition-colors hover:bg-[#8d745d]/10 
                        ${isActive 
                          ? "bg-[#8d745d]/15 text-primary hover:bg-[#8d745d]/15" 
                          : "text-muted-foreground hover:text-primary"
                        }
                      `}
                    >
                      <Link href={item.href}>
                        <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-[#8d745d]/30">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-2">
              <UserButton
                appearance={{ 
                  elements: { userButtonAvatarBox: "w-10 h-10" }, 
                  baseTheme: dark 
                }}
                afterSignOutUrl={signedOutUrl}
              />
              {!isCollapsed && (
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
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  )
}