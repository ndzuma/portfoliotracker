import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Railway webhook payload (verified from webhook.site):
//
// {
//   "type": "Deployment.deployed",        ← this is the signal
//   "severity": "info",
//   "timestamp": "2026-02-13T12:53:45.567Z",
//   "resource": {
//     "workspace":   { "id": "...", "name": "..." },
//     "project":     { "id": "...", "name": "pulseportfolio" },
//     "environment": { "id": "...", "name": "production", "isEphemeral": false },
//     "service":     { "id": "...", "name": "Application" },    ← sometimes absent
//     "deployment":  { "id": "..." }                            ← sometimes absent
//   },
//   "details": {}                          ← empty on test webhooks, populated on real deploys
// }
//
// Valid event types we care about:
//   - Deployment.deployed
//   - Deployment.redeployed

const DEPLOY_TYPES = new Set(["deployment.deployed", "deployment.redeployed"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const eventType = (body.type || "").toLowerCase();

    // Only process deploy/redeploy events — ignore everything else
    if (!DEPLOY_TYPES.has(eventType)) {
      return NextResponse.json({
        success: true,
        message: `Ignored event type: ${body.type}`,
      });
    }

    const details = body.details || {};
    const resource = body.resource || {};

    // Resolve deployment ID — fall back to timestamp-based ID when details is empty
    const deploymentId =
      details.id ||
      resource.deployment?.id ||
      `deploy-${body.timestamp || Date.now()}`;

    // Extract whatever metadata is available
    const serviceName = resource.service?.name;
    const environment = resource.environment?.name;
    const branch = details.branch;
    const commitMessage = details.commitMessage;
    const commitAuthor = details.commitAuthor;

    // Type matched → this IS a successful deploy, no status gating needed
    await convex.mutation(api.deployments.recordDeployment, {
      deploymentId,
      status: "success",
      serviceName,
      environment,
      branch,
      commitMessage,
      commitAuthor,
    });

    return NextResponse.json({
      success: true,
      message: `Deployment ${deploymentId} recorded`,
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
