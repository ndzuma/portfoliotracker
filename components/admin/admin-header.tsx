"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GearSix, Flag } from "@phosphor-icons/react";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export function AdminHeader() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        borderColor: "rgba(255,255,255,0.06)",
        background: "rgba(9,9,11,0.92)",
      }}
    >
      <div className="max-w-[1600px] mx-auto flex items-center">
        <div className="flex items-center w-full">
          {/* Logo */}
          <div
            className="flex items-center px-6 py-3 shrink-0 border-r"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <Link href="/admin" className="flex items-center gap-2">
              <GearSix className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-semibold text-white tracking-tight">
                Admin Panel
              </span>
            </Link>
          </div>

          {/* Nav Items */}
          <div className="flex items-center">
            <div
              className="flex items-center border-r"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <Link href="/admin/flags" className="block">
                <div
                  className={`flex items-center gap-2 px-4 py-3 transition-all hover:bg-white/[0.04] ${
                    isActive("/admin/flags")
                      ? "bg-white/[0.06] text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Flag className="h-3.5 w-3.5 shrink-0" />
                  <span className="text-xs font-medium whitespace-nowrap">
                    Feature Flags
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Section - User */}
          <div className="flex items-center ml-auto px-4 py-3">
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
