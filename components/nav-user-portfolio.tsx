"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"
import { UserButton, useUser } from "@clerk/nextjs"
import { dark } from '@clerk/themes'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// get sign out url from env
const signedOutUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_OUT_URL || "/";

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user } = useUser()

  // Demo user data for when user is not authenticated
  const demoUser = {
    name: "Demo User",
    email: "demo@example.com",
    avatar: "",
  }

  const currentUser = user ? {
    name: user.fullName || "User",
    email: user.emailAddresses[0]?.emailAddress || "user@example.com",
    avatar: user.imageUrl || "",
  } : demoUser

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-[#8d745d]/10 data-[state=open]:text-foreground hover:bg-[#8d745d]/10"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback className="rounded-lg bg-[#8d745d] text-white">
                  {currentUser.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{currentUser.name}</span>
                <span className="truncate text-xs">{currentUser.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback className="rounded-lg bg-[#8d745d] text-white">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{currentUser.name}</span>
                  <span className="truncate text-xs">{currentUser.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {user ? (
              <div className="p-1">
                <UserButton
                  appearance={{ 
                    elements: { 
                      userButtonAvatarBox: "w-8 h-8",
                      userButtonBox: "w-full justify-start gap-2 p-2 hover:bg-accent",
                      userButtonTrigger: "w-full justify-start gap-2 p-0",
                    }, 
                    baseTheme: dark 
                  }}
                  afterSignOutUrl={signedOutUrl}
                  showName
                />
              </div>
            ) : (
              <DropdownMenuItem>
                <LogOut />
                Log out
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}