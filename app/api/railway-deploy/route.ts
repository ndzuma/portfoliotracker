import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Railway's actual webhook payload structure (from live logs):
//
// {
//   "type": "Deployment.deployed",
//   "severity": "INFO",
//   "timestamp": "2026-02-12T22:36:03.576Z",
//   "details": {
//     "id": "c9830579-...",
//     "status": "SUCCESS",
//     "branch": "main",
//     "source": "GitHub",
//     "builder": "RAILPACK",
//     "commitHash": "ecc03d6...",
//     "commitAuthor": "ndzuma",
//     "commitMessage": "Merge pull request #13 ...",
//     "serviceId": "d9f066db-...",
//     "repoSource": "ndzuma/portfoliotracker"
//   },
//   "resource": {
//     "project":     { "id": "...", "name": "pulseportfolio" },
//     "service":     { "id": "...", "name": "Application" },
//     "environment": { "id": "...", "name": "production", "isEphemeral": false },
//     "deployment":  { "id": "c9830579-..." },
//     "workspace":   { "id": "...", "name": "..." }
//   }
// }
//
// Railway test webhooks send "details": {} (empty) — we ACK those with 200.

// Map Railway's webhook status to our internal representation
function normalizeStatus(rawStatus: string): string {
  const lower = rawStatus.toLowerCase();
  if (lower === "success") return "success";
  if (lower === "initializing") return "pending";
  return lower;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const details = body.details || {};
    const resource = body.resource || {};

    // Railway test webhooks send empty details — ACK gracefully
    if (!details.id && !details.status) {
      return NextResponse.json({
        success: true,
        message: "Test webhook received — no deployment data to record",
        type: body.type,
      });
    }

    // Extract deployment data from details
    const deploymentId =
      details.id || resource.deployment?.id || body.id || body.deploymentId;
    const rawStatus = details.status || body.status;

    // Extract service & environment from resource
    const serviceName =
      resource.service?.name || body.service?.name || body.serviceName;
    const environment =
      resource.environment?.name || body.environment?.name || body.environment;

    // Extract commit metadata from details
    const branch = details.branch || body.meta?.branch || body.branch;
    const commitMessage =
      details.commitMessage || body.meta?.commitMessage || body.commitMessage;
    const commitAuthor =
      details.commitAuthor || body.meta?.commitAuthor || body.commitAuthor;

    if (!deploymentId || !rawStatus) {
      console.error(
        "Railway webhook: missing deploymentId or status. Received body:",
        JSON.stringify(body, null, 2),
      );
      return NextResponse.json(
        { error: "Missing required fields: deploymentId and status" },
        { status: 400 },
      );
    }

    const status = normalizeStatus(rawStatus);

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

    return NextResponse.json({
      success: true,
      message: `Deployment ${deploymentId} recorded as ${status}`,
    });
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
