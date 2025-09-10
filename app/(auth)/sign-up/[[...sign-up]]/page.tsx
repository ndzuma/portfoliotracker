"use client";

import React from "react";
import { SignUp, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { redirect, RedirectType } from 'next/navigation'

export default function SignUpPage() {
  const { isSignedIn } = useUser();
  
  if (isSignedIn) { 
    // Redirect to dashboard
    redirect('/', RedirectType.push)
  }
  
  return (
    <div className="min-h-screen grid relative">
      {/* Moving Gradient Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(-45deg, #292929, #1f1f1f, #141414, #0a0a0a, #000000)",
          backgroundSize: "400% 400%",
          animation: "gradient 15s ease infinite",
        }}
      ></div>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <SignUp
            appearance={{
              baseTheme: dark,
              layout: {
                logoImageUrl: "https://5qpxxrwjkp.ufs.sh/f/NnmmcSZaZgmni3c1PnL6dvzNamEMhwL3OBGIDZKUbAnWSVJl",
                logoLinkUrl: "https://www.pulsefolio.net",
                privacyPageUrl: "https://www.pulsefolio.net/privacy",
                termsPageUrl: "https://www.pulsefolio.net/terms",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}