import { NextRequest, NextResponse } from "next/server";

export interface Deployment {
  deploymentId: string;
  status: string;
  serviceName?: string;
  environment?: string;
  branch?: string;
  commitMessage?: string;
  commitAuthor?: string;
  triggeredAt: number;
}

let latestDeployment: Deployment | null = null;

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
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "building", "deploying", "success", "failed", "cancelled"];
    if (!validStatuses.includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    latestDeployment = {
      deploymentId,
      status: status.toLowerCase(),
      serviceName,
      environment,
      branch,
      commitMessage,
      commitAuthor,
      triggeredAt: Date.now(),
    };

    return NextResponse.json({ success: true, message: "Deployment recorded" });
  } catch (error) {
    console.error("Error handling Railway webhook:", error);
    return NextResponse.json(
      { error: "Failed to process deployment webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ deployment: latestDeployment });
}
