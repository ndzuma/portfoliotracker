import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user by Clerk ID
    const user = await convex.query(api.users.getUserByClerkId, {
      clerkId: userId,
    });

    if (!user) {
      return NextResponse.json(
        { uiVersion: "v1", earlyAccess: false },
        { status: 200 }
      );
    }

    // Get user preferences
    const preferences = await convex.query(api.users.getUserPreferences, {
      userId: user._id,
    });

    return NextResponse.json({
      uiVersion: preferences?.uiVersion || "v1",
      earlyAccess: preferences?.earlyAccess || false,
    });
  } catch (error) {
    console.error("Error checking UI version:", error);
    return NextResponse.json(
      { uiVersion: "v1", earlyAccess: false },
      { status: 200 }
    );
  }
}
