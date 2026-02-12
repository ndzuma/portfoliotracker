import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Railway's actual deployment states from their docs
// https://docs.railway.com/deployments/reference
const RAILWAY_STATUSES = new Set([
  "initializing",
  "building",
  "deploying",
  "active",
  "completed",
  "crashed",
  "failed",
  "removing",
  "removed",
]);

// Map Railway's status to our internal representation
// "active" in Railway means the deployment is live and serving traffic
function normalizeStatus(rawStatus: string): string {
  const lower = rawStatus.toLowerCase();
  if (lower === "active") return "success";
  if (lower === "initializing") return "pending";
  return lower;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Railway webhook payload structure:
    // {
    //   type: "deploy",
    //   timestamp: "...",
    //   project: { id, name },
    //   environment: { id, name },
    //   service: { id, name },
    //   deployment: { id, status, meta: { branch, commitMessage, commitAuthor } }
    // }
    //
    // Also handle flat payloads for manual/test webhook calls.

    // Extract deployment data — handle both nested (Railway) and flat (manual) payloads
    const deployment = body.deployment || body;
    const deploymentId =
      deployment.id || deployment.deploymentId || body.id || body.deploymentId;
    const rawStatus = deployment.status || body.status;

    // Service & environment can be at top level (Railway) or nested
    const serviceName =
      body.service?.name || deployment.service?.name || body.serviceName;
    const environment =
      body.environment?.name ||
      deployment.environment?.name ||
      body.environment;

    // Meta fields — Railway nests under deployment.meta
    const meta = deployment.meta || body.meta || {};
    const branch = meta.branch || deployment.branch || body.branch;
    const commitMessage =
      meta.commitMessage || deployment.commitMessage || body.commitMessage;
    const commitAuthor =
      meta.commitAuthor || deployment.commitAuthor || body.commitAuthor;

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

    // Validate against Railway's actual deployment states
    if (!RAILWAY_STATUSES.has(rawStatus.toLowerCase())) {
      console.error(
        `Railway webhook: unrecognized status "${rawStatus}". Received body:`,
        JSON.stringify(body, null, 2),
      );
      return NextResponse.json(
        {
          error: `Unrecognized status: ${rawStatus}. Expected one of: ${[...RAILWAY_STATUSES].join(", ")}`,
        },
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
