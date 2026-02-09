"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { TrendUp } from "@phosphor-icons/react";
import { Authenticated, Unauthenticated } from "convex/react";
import { RedirectToSignIn } from "@clerk/nextjs";
import { OnboardingFlow } from "@/components/onboarding-flow";

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
      // New user - create Convex record with hasOnboarded: false
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
      // User exists but hasn't completed onboarding, show onboarding flow
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
          <TrendUp className="h-12 w-12 mx-auto text-primary animate-pulse" />
          <h2 className="text-2xl font-semibold">Setting up your account...</h2>
          <p className="text-muted-foreground">
            We're getting everything ready for you.
          </p>
        </div>
      </div>
    );
  }

  // Show the multi-step onboarding flow for users who haven't completed onboarding
  if (existingUser && !existingUser.hasOnboarded) {
    return (
      <OnboardingFlow
        userId={existingUser._id}
        userName={user?.fullName || user?.username || "User"}
      />
    );
  }

  return (
    <>
      <Authenticated>
        {/* This should not be reached if user hasn't completed onboarding */}
        <div className="flex flex-col items-center justify-center min-h-screen bg-background">
          <div className="text-center space-y-4">
            <TrendUp className="h-12 w-12 mx-auto text-primary animate-pulse" />
            <h2 className="text-2xl font-semibold">Something went wrong</h2>
            <p className="text-muted-foreground">
              Please refresh the page or contact support.
            </p>
          </div>
        </div>
      </Authenticated>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
    </>
  );
}
