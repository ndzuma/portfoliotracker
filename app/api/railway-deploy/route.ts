import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const deploymentId = body.id || body.deploymentId;
    const status = body.status;
    const serviceName = body.service?.name || body.serviceName;
    const environment = body.environment?.name || body.environment;
    const branch = body.meta?.branch || body.branch;
    const commitMessage = body.meta?.commitMessage || body.commitMessage;
    const commitAuthor = body.meta?.commitAuthor || body.commitAuthor;

    if (!deploymentId || !status) {
      return NextResponse.json(
        { error: "Missing required fields: deploymentId and status" },
        { status: 400 },
      );
    }

    const validStatuses = [
      "pending",
      "building",
      "deploying",
      "success",
      "failed",
      "cancelled",
    ];
    if (!validStatuses.includes(status.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Persist to Convex — survives cold starts, instance recycling, redeployments
    await convex.mutation(api.deployments.recordDeployment, {
      deploymentId,
      status,
      serviceName,
      environment,
      branch,
      commitMessage,
      commitAuthor,
    });

    return NextResponse.json({ success: true, message: "Deployment recorded" });
  } catch (error) {
    console.error("Error handling Railway webhook:", error);
    return NextResponse.json(
      { error: "Failed to process deployment webhook" },
      { status: 500 },
    );
  }
}

// GET fallback — reads latest deployment from Convex for non-reactive clients
export async function GET() {
  try {
    const deployment = await convex.query(api.deployments.getLatest);
    return NextResponse.json({ deployment: deployment ?? null });
  } catch (error) {
    console.error("Error fetching latest deployment:", error);
    return NextResponse.json({ deployment: null });
  }
}
