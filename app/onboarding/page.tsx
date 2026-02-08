"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  Briefcase,
  TrendingUp,
  Shield,
  PieChart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Authenticated, Unauthenticated } from "convex/react";
import { RedirectToSignIn } from "@clerk/nextjs";

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);

  // Check if user exists in Convex
  const existingUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  // Create user mutation
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (isLoaded && user && existingUser === null) {
      // New user - create Convex record
      createUser({
        name: user.fullName || user.username || "New User",
        email: user.primaryEmailAddress?.emailAddress || "",
        clerkId: user.id,
      }).then(() => {
        setIsProcessing(false);
      });
    } else if (isLoaded && user && existingUser && existingUser.hasOnboarded) {
      // User has completed onboarding, redirect to dashboard
      setIsProcessing(false);
      router.push("/");
    } else if (isLoaded && user && existingUser && !existingUser.hasOnboarded) {
      // User exists but hasn't completed onboarding, show onboarding
      setIsProcessing(false);
    } else if (isLoaded && !user) {
      // No user logged in, redirect to login
      router.push("/");
    }
  }, [isLoaded, user, existingUser, createUser, router]);

  if (!isLoaded || isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <TrendingUp className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <h2 className="text-2xl font-semibold">Setting up your account...</h2>
          <p className="text-muted-foreground">
            We're getting everything ready for you.
          </p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: "Portfolio Management",
      description:
        "Track all your investments in one place with real-time updates.",
    },
    {
      icon: <PieChart className="h-8 w-8 text-accent" />,
      title: "Asset Allocation",
      description:
        "Visualize your portfolio distribution across different asset classes.",
    },
    {
      icon: <Shield className="h-8 w-8 text-secondary" />,
      title: "Secure Data",
      description:
        "Your financial information is protected with top-tier security measures.",
    },
  ];

  return (
    <>
      <Authenticated>
        <div className="flex min-h-screen min -w-screen bg-background justify-center items-center">
          {/* Main content */}
          <div className="py-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <Image
                  src="/pp-mini.png"
                  alt="PortfolioTracker Logo"
                  width={75}
                  height={75}
                  className="mx-auto"
                />
              </div>

              <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-3">
                  Welcome to Pulseportfolio!
                </h1>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-card/50 backdrop-blur-sm border-[#8d745d]/30 min-w-80"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        {feature.icon}
                        <CardTitle>{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mb-10">
                <p className="text-muted-foreground">
                  You're all set! Click the button below to go to your dashboard
                  and start managing your portfolio.
                </p>
              </div>

              <div className="flex justify-center mb-10">
                <Button asChild size="lg" className="group">
                  <Link href="/">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
    </>
  );
}
