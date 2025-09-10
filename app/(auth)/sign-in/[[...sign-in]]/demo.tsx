"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignInForm } from "@/components/auth/sign-in-form";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="flex flex-col justify-center p-12 relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <Image
              src="/pp-big.png"
              alt="PulsePortfolio"
              width={48}
              height={48}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-foreground">PulsePortfolio</h1>
          </div>
          
          <div className="space-y-6 max-w-md">
            <h2 className="text-4xl font-bold text-foreground leading-tight">
              Welcome back to your
              <span className="text-primary block">investment dashboard</span>
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Monitor your stocks, crypto, real estate, and more with powerful analytics 
              and AI-powered insights to optimize your investments.
            </p>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Real-time portfolio tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">AI-powered market insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Multi-asset portfolio management</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <Image
                  src="/pp-mini.png"
                  alt="PulsePortfolio"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span className="text-xl font-bold">PulsePortfolio</span>
              </div>
              
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription className="text-base">
                Sign in to access your investment dashboard
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <SignInForm />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link 
                    href="/sign-up" 
                    className="text-primary hover:text-primary/80 font-medium hover:underline"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}