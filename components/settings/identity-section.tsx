"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Section, SettingRow } from "./settings-primitives";
import {
  ArrowSquareOut,
  User,
  EnvelopeSimple,
  Shield,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export function IdentitySection() {
  const { user: clerkUser } = useUser();
  const clerk = useClerk();
  const t = useTranslations("settings");

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: clerkUser?.id || "",
  });

  const displayName = clerkUser?.fullName || convexUser?.name || "—";
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress || convexUser?.email || "—";
  const avatarUrl = clerkUser?.imageUrl;
  const memberSince = clerkUser?.createdAt
    ? new Date(clerkUser.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      })
    : "—";

  return (
    <Section
      title={t("identity")}
      description={t("identityDescription")}
      status="live"
    >
      {/* Avatar + Name + Email row */}
      <div className="flex items-start gap-4 py-4 border-b border-white/[0.03]">
        {/* Avatar */}
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-14 h-14 rounded-xl border border-white/[0.08] object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center">
              <User className="h-6 w-6 text-zinc-600" />
            </div>
          )}
          {/* Online dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-zinc-950 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Name + email */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h4 className="text-base font-semibold text-white truncate">
            {displayName}
          </h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <EnvelopeSimple className="h-3 w-3 text-zinc-600 shrink-0" />
            <span className="text-xs text-zinc-500 truncate">{email}</span>
          </div>
          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
              {t("memberSince", { date: memberSince })}
            </span>
            {convexUser?.isAdmin && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-semibold uppercase tracking-wider">
                <Shield className="h-2.5 w-2.5" />
                {t("admin")}
              </span>
            )}
          </div>
        </div>

        {/* Manage profile link → Clerk */}
        <button
          onClick={() => clerk.openUserProfile()}
          className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors shrink-0 mt-1"
        >
          {t("manage")}
          <ArrowSquareOut className="h-3 w-3" />
        </button>
      </div>

      {/* Settings rows */}
      <SettingRow
        label={t("displayName")}
        description={t("displayNameDescription")}
      >
        <span className="text-xs text-zinc-400 font-medium bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.04]">
          {displayName}
        </span>
      </SettingRow>

      <SettingRow
        label={t("email")}
        description={t("emailDescription")}
      >
        <span className="text-xs text-zinc-500">{email}</span>
      </SettingRow>
    </Section>
  );
}
