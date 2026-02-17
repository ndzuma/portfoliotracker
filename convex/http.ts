import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * POST /clerk-billing-webhook
 * Receives Clerk billing webhook events and syncs subscription state to Convex
 *
 * Webhook verification:
 * 1. Extract svix-id, svix-timestamp, svix-signature from headers
 * 2. Read raw request body as text
 * 3. Verify HMAC-SHA256 signature using CLERK_WEBHOOK_SECRET
 * 4. Parse JSON and handle subscription events
 */
http.route({
  path: "/clerk-billing-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // ──── Step 1: Extract Svix headers ────
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("[Webhook] Missing Svix headers");
      return new Response("Missing Svix headers", { status: 400 });
    }

    // ──── Step 2: Read raw body as text ────
    const body = await request.text();

    // ──── Step 3: Verify webhook signature ────
    const secret = process.env.CLERK_WEBHOOK_SECRET;
    if (!secret) {
      console.error("[Webhook] CLERK_WEBHOOK_SECRET not set");
      return new Response("Webhook secret not configured", { status: 500 });
    }

    try {
      // Secret from Clerk starts with "whsec_" — strip that and base64-decode
      const secretB64 = secret.replace("whsec_", "");
      const secretBytes = new Uint8Array(
        atob(secretB64)
          .split("")
          .map((c) => c.charCodeAt(0))
      );

      // Create the signed content string
      const signedContent = `${svixId}.${svixTimestamp}.${body}`;

      // Sign with HMAC-SHA256
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        secretBytes,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );

      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(signedContent),
      );

      // Base64-encode the result using btoa
      const signatureArray = new Uint8Array(signature);
      const binaryString = String.fromCharCode.apply(null, Array.from(signatureArray));
      const computedSignature = `v1,${btoa(binaryString)}`;

      // Compare against all signatures in the header
      const signatures = svixSignature.split(" ");
      const isValid = signatures.some((sig) => sig === computedSignature);

      if (!isValid) {
        console.error("[Webhook] Signature verification failed", {
          expected: computedSignature,
          received: svixSignature,
        });
        return new Response("Invalid signature", { status: 400 });
      }

      console.log("[Webhook] Signature verified ✓");
    } catch (error) {
      console.error("[Webhook] Signature verification error:", error);
      return new Response("Signature verification failed", { status: 400 });
    }

    // ──── Step 4: Parse JSON body ────
    let event: any;
    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error("[Webhook] Failed to parse JSON:", error);
      return new Response("Invalid JSON", { status: 400 });
    }

    console.log(`[Webhook] Received event type: ${event.type}`, {
      eventType: event.type,
      clerkUserId: event.data?.subscriber?.id,
      planSlug: event.data?.plan?.slug,
    });

    // ──── Step 5: Handle subscription events ────
    try {
      const eventType = event.type;
      const planSlug = event.data?.plan?.slug;
      const clerkUserId = event.data?.subscriber?.id;
      const subscriptionItemId = event.data?.id;

      if (!clerkUserId) {
        console.warn("[Webhook] Missing subscriber ID in event");
        return new Response("Missing subscriber ID", { status: 400 });
      }

      if (!subscriptionItemId) {
        console.warn("[Webhook] Missing subscription item ID in event");
        return new Response("Missing subscription item ID", { status: 400 });
      }

      switch (eventType) {
        case "subscriptionItem.active": {
          // User is on an active paid plan
          const tier =
            planSlug === "pro" ? ("pro" as const) : ("free" as const);
          console.log(`[Webhook] Activating ${tier} subscription for ${clerkUserId}`);
          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "active",
            subscriptionItemId,
          });
          break;
        }

        case "subscriptionItem.canceled": {
          // Subscription has been canceled but may still be active through billing period
          const tier =
            planSlug === "pro" ? ("pro" as const) : ("free" as const);
          console.log(
            `[Webhook] Marking ${tier} subscription as canceled for ${clerkUserId}`,
          );
          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "canceled",
            subscriptionItemId,
          });
          break;
        }

        case "subscriptionItem.ended": {
          // Subscription has fully ended — downgrade to free
          console.log(`[Webhook] Subscription ended, downgrading to free for ${clerkUserId}`);
          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier: "free",
            status: "ended",
            subscriptionItemId,
          });
          break;
        }

        case "subscriptionItem.upcoming": {
          // A new subscription is coming (e.g., renewal); don't change tier yet
          console.log(
            `[Webhook] Upcoming subscription (billing period starting soon) for ${clerkUserId}`,
          );
          const tier =
            planSlug === "pro" ? ("pro" as const) : ("free" as const);
          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "upcoming",
            subscriptionItemId,
          });
          break;
        }

        case "subscriptionItem.pastDue": {
          // Payment is overdue
          console.log(`[Webhook] Subscription past due for ${clerkUserId}`);
          const tier =
            planSlug === "pro" ? ("pro" as const) : ("free" as const);
          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "past_due",
            subscriptionItemId,
          });
          break;
        }

        case "subscriptionItem.incomplete": {
          // Payment is incomplete
          console.log(`[Webhook] Subscription incomplete for ${clerkUserId}`);
          const tier =
            planSlug === "pro" ? ("pro" as const) : ("free" as const);
          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "incomplete",
            subscriptionItemId,
          });
          break;
        }

        default:
          console.warn(`[Webhook] Unhandled event type: ${eventType}`);
      }

      console.log(
        `[Webhook] Successfully processed event: ${eventType} for user ${clerkUserId}`,
      );
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("[Webhook] Error processing event:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;
