"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/sign-up-form";
import Image from "next/image";

export default function SignUpPage() {
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
              Start building your
              <span className="text-primary block">investment portfolio</span>
            </h2>
            
            <p className="text-muted-foreground text-lg leading-relaxed">
              Join thousands of investors using PulsePortfolio to track and optimize 
              their financial assets with advanced analytics and insights.
            </p>
            
            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Track unlimited portfolios</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Real-time market data & news</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Professional-grade analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Free to get started</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign Up Form */}
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
              
              <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
              <CardDescription className="text-base">
                Get started with your investment tracking journey
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <SignUpForm />
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    href="/sign-in" 
                    className="text-primary hover:text-primary/80 font-medium hover:underline"
                  >
                    Sign in
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