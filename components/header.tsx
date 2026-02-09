"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  ChartPieSlice,
  MagnifyingGlass,
  Bell,
  Newspaper,
  Binoculars,
  Flask,
  CalendarDots,
  GearSix,
  List,
  X,
} from "@phosphor-icons/react";
import { UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  CommandPalette,
  useCommandPalette,
} from "@/components/command-palette";

const BASE_NAV_ITEMS = [
  { id: "overview", label: "Overview", href: "/", icon: ChartPieSlice },
  { id: "news", label: "News", href: "/news", icon: Newspaper },
  {
    id: "watchlist",
    label: "Watchlist",
    href: "/watchlist",
    icon: Binoculars,
    flagKey: "watchlist",
  },
  {
    id: "research",
    label: "Research",
    href: "/research",
    icon: Flask,
    flagKey: "research",
  },
  {
    id: "earnings",
    label: "Earnings",
    href: "/earnings",
    icon: CalendarDots,
    flagKey: "earnings",
  },
  { id: "settings", label: "Settings", href: "/settings", icon: GearSix },
];

// Spring config for the label reveal
const labelSpring = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

const labelFadeSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
  mass: 0.6,
};

function NavItem({
  item,
  isActive,
  isLast,
}: {
  item: (typeof BASE_NAV_ITEMS)[0];
  isActive: boolean;
  isLast: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;
  const showLabel = isActive || isHovered;

  return (
    <div
      className={`${!isLast ? "border-r" : ""}`}
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <Link href={item.href} className="h-full flex">
        <motion.div
          className="relative flex items-center gap-2.5 py-3 cursor-pointer h-full"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          animate={{
            paddingLeft: showLabel ? 20 : 16,
            paddingRight: showLabel ? 20 : 16,
          }}
          transition={labelSpring}
        >
          {/* Active indicator — gold bottom line, flush to border */}
          {isActive && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-[2px]"
              style={{ background: "var(--primary)" }}
              layoutId="nav-active-indicator"
              transition={labelSpring}
            />
          )}

          {/* Hover glow */}
          <AnimatePresence>
            {isHovered && !isActive && (
              <motion.div
                className="absolute inset-0"
                style={{ background: "rgba(255,255,255,0.03)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            )}
          </AnimatePresence>

          {/* Icon */}
          <motion.div
            className="relative z-10 shrink-0"
            animate={{
              color: isActive
                ? "var(--primary)"
                : isHovered
                  ? "rgba(255,255,255,0.85)"
                  : "rgba(255,255,255,0.35)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Icon size={16} weight={isActive ? "duotone" : "regular"} />
          </motion.div>

          {/* Label — animated width reveal */}
          <motion.div
            className="relative z-10 overflow-hidden"
            animate={{
              width: showLabel ? "auto" : 0,
            }}
            initial={false}
            transition={labelSpring}
          >
            <motion.span
              className="text-xs font-medium whitespace-nowrap block"
              animate={{
                opacity: showLabel ? 1 : 0,
                x: showLabel ? 0 : -8,
                color: isActive
                  ? "rgba(255,255,255,1)"
                  : "rgba(255,255,255,0.65)",
              }}
              transition={labelFadeSpring}
            >
              {item.label}
            </motion.span>
          </motion.div>
        </motion.div>
      </Link>
    </div>
  );
}

function MobileNavItem({
  item,
  isActive,
  onClose,
  index,
}: {
  item: (typeof BASE_NAV_ITEMS)[0];
  isActive: boolean;
  onClose: () => void;
  index: number;
}) {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{
        ...labelSpring,
        delay: index * 0.04,
      }}
    >
      <Link href={item.href} onClick={onClose} className="block">
        <div
          className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
            isActive
              ? "bg-white/[0.08] text-white"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Icon
            size={18}
            weight={isActive ? "duotone" : "regular"}
            style={isActive ? { color: "var(--primary)" } : undefined}
          />
          <span className="text-sm font-medium">{item.label}</span>
          {isActive && (
            <motion.div
              className="ml-auto w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--primary)" }}
              layoutId="mobile-nav-dot"
              transition={labelSpring}
            />
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Search Nav Button (expand-on-hover, ticker-cell DNA) ─────
function SearchNavButton({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      className="flex items-center gap-2 py-3 text-zinc-500 hover:text-white transition-colors relative cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      animate={{
        paddingLeft: isHovered ? 16 : 14,
        paddingRight: isHovered ? 16 : 14,
      }}
      transition={labelSpring}
      whileTap={{ scale: 0.97 }}
    >
      {/* Hover glow */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0"
            style={{ background: "rgba(255,255,255,0.03)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="relative z-10 shrink-0"
        animate={{
          color: isHovered
            ? "rgba(255,255,255,0.85)"
            : "rgba(255,255,255,0.35)",
        }}
        transition={{ duration: 0.2 }}
      >
        <MagnifyingGlass size={15} weight="regular" />
      </motion.div>

      {/* Label + shortcut — animated width reveal */}
      <motion.div
        className="relative z-10 overflow-hidden"
        animate={{ width: isHovered ? "auto" : 0 }}
        initial={false}
        transition={labelSpring}
      >
        <motion.span
          className="text-xs font-medium whitespace-nowrap flex items-center gap-2"
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : -8,
            color: "rgba(255,255,255,0.65)",
          }}
          transition={labelFadeSpring}
        >
          Search
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] text-zinc-600 font-mono">
            ⌘K
          </kbd>
        </motion.span>
      </motion.div>
    </motion.button>
  );
}

export function V2Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();
  const { open: commandPaletteOpen, setOpen: setCommandPaletteOpen } =
    useCommandPalette();

  // Get convex user for search
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const userId = convexUser?._id;

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
    return true;
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
          {/* ─── Mobile Layout ─── */}
          <div className="flex md:hidden items-center justify-between w-full px-4 py-3">
            <Link href="/" className="flex items-center">
              <span className="text-sm font-semibold text-white tracking-tight">
                PulsePortfolio
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {searchEnabled && (
                <button
                  onClick={() => setCommandPaletteOpen(true)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  <MagnifyingGlass size={16} weight="regular" />
                </button>
              )}
              {notificationsEnabled && (
                <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors relative">
                  <Bell size={16} weight="regular" />
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
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] transition-colors ml-1"
                whileTap={{ scale: 0.92 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X size={16} weight="bold" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <List size={16} weight="bold" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* ─── Desktop Layout ─── */}
          <div className="hidden md:flex items-stretch w-full">
            {/* Logo cell */}
            <div
              className="flex items-center px-6 py-3 shrink-0 border-r"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <Link href="/" className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white tracking-tight">
                  PulsePortfolio
                </span>
              </Link>
            </div>

            {/* Nav items — ticker-cell DNA with expand/collapse */}
            <div className="flex items-stretch">
              {NAV_ITEMS.map((item, index) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeId === item.id}
                  isLast={index === NAV_ITEMS.length - 1}
                />
              ))}
            </div>

            {/* Right section — utility icons */}
            <div
              className="flex items-stretch ml-auto border-l"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              {searchEnabled && (
                <SearchNavButton onClick={() => setCommandPaletteOpen(true)} />
              )}
              {notificationsEnabled && (
                <motion.button
                  className="flex items-center px-3.5 py-3 text-zinc-500 hover:text-white transition-colors relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell size={15} weight="regular" />
                  <motion.span
                    className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />
                </motion.button>
              )}
              <div className="flex items-center px-3.5 py-3">
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

        {/* ─── Mobile Menu Dropdown ─── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden border-t overflow-hidden"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                height: { ...labelSpring },
                opacity: { duration: 0.2 },
              }}
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_ITEMS.map((item, index) => (
                  <MobileNavItem
                    key={item.id}
                    item={item}
                    isActive={activeId === item.id}
                    onClose={closeMobileMenu}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        userId={userId}
      />

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMobileMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
}
