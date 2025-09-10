"use client";

import React from "react";
import Image from "next/image";
import { SignIn, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { redirect, RedirectType } from 'next/navigation'

export default function SignInPage() {
  const { isSignedIn } = useUser();
  
  if (isSignedIn) { 
    // Redirect to dashboard
    redirect('/', RedirectType.push)
  }
    
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 col-span-1">
        <div className="w-full max-w-md">
          <SignIn
            appearance={{
              baseTheme: dark,
            }}
          />
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:flex-1 rounded-3xl m-5 ml-0 bg-gradient-to-br from-[#18181A]/50 via-[#B836A6]/50 to-[#E7315C]/50 relative overflow-hidden col-span-1">
        <div className="flex flex-col min-w-full items-center justify-center p-15 relative z-10">
          <Image
            src="https://5qpxxrwjkp.ufs.sh/f/NnmmcSZaZgmng7fiun8iuWN7UPHl8L9vcdoetQMkOmjhIT2K"
            alt="PulsePortfolio"
            quality={100}
            width={800}
            height={800}
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
