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

      // Log the raw event structure for debugging
      console.log("[Webhook] Full event payload:", JSON.stringify(event, null, 2));

      // For Clerk Billing webhooks, the user ID is in data.payer.user_id
      // (not data.subscriber.id which is for user webhooks)
      const clerkUserId = event.data?.payer?.user_id;

      if (!clerkUserId) {
        console.warn("[Webhook] Missing user ID in event, skipping");
        // Still return 200 to acknowledge receipt
        return new Response("OK", { status: 200 });
      }

      // Extract subscription item ID (varies by event type)
      const subscriptionItemId = event.data?.id || event.data?.subscription_id || null;

      // Extract plan slug if available
      const planSlug = event.data?.plan?.slug;

      console.log("[Webhook] Extracted data:", {
        eventType,
        clerkUserId,
        subscriptionItemId,
        planSlug,
      });

      switch (eventType) {
        // ─── Top-level subscription events ───
        case "subscription.created": {
          console.log(`[Webhook] Subscription created for user ${clerkUserId}`);
          // Determine tier based on first active item
          const items = event.data?.items || [];
          const activeItem = items.find(
            (item: any) => item.status === "active"
          );
          const tier =
            activeItem?.plan?.slug === "pro" ? ("pro" as const) : ("free" as const);
          const itemId = activeItem?.id || subscriptionItemId || "unknown";

          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "active",
            subscriptionItemId: itemId,
          });
          break;
        }

        case "subscription.updated": {
          console.log(`[Webhook] Subscription updated for user ${clerkUserId}`);
          // Find the active subscription item (or upcoming if transitioning)
          const items = event.data?.items || [];
          const activeItem = items.find(
            (item: any) => item.status === "active"
          );
          const upcomingItem = items.find(
            (item: any) => item.status === "upcoming"
          );

          // Prefer active item, fall back to upcoming (plan change)
          const itemToProcess = activeItem || upcomingItem;

          if (itemToProcess) {
            const tier =
              itemToProcess.plan?.slug === "pro" ? ("pro" as const) : ("free" as const);
            const itemId = itemToProcess.id || subscriptionItemId || "unknown";

            await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
              clerkUserId,
              tier,
              status: itemToProcess.status === "active" ? "active" : "upcoming",
              subscriptionItemId: itemId,
            });
          }
          break;
        }

        case "subscription.active": {
          console.log(`[Webhook] Subscription activated for user ${clerkUserId}`);
          const items = event.data?.items || [];
          const activeItem = items.find((item: any) => item.status === "active");
          const tier =
            activeItem?.plan?.slug === "pro" ? ("pro" as const) : ("free" as const);
          const itemId = activeItem?.id || subscriptionItemId || "unknown";

          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "active",
            subscriptionItemId: itemId,
          });
          break;
        }

        case "subscription.pastDue": {
          console.log(`[Webhook] Subscription past due for user ${clerkUserId}`);
          const items = event.data?.items || [];
          const pastDueItem = items.find((item: any) => item.status === "past_due");
          const tier =
            pastDueItem?.plan?.slug === "pro" ? ("pro" as const) : ("free" as const);
          const itemId = pastDueItem?.id || subscriptionItemId || "unknown";

          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "past_due",
            subscriptionItemId: itemId,
          });
          break;
        }

        // ─── Subscription item events ───
        case "subscriptionItem.active": {
          console.log(`[Webhook] Subscription item activated for user ${clerkUserId}`);
          const tier =
            planSlug === "pro" ? ("pro" as const) : ("free" as const);
          const itemId = subscriptionItemId || "unknown";

          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "active",
            subscriptionItemId: itemId,
          });
          break;
        }

        case "subscriptionItem.canceled": {
          console.log(
            `[Webhook] Subscription item canceled for user ${clerkUserId}`,
          );
          const tier =
            planSlug === "pro" ? ("pro" as const) : ("free" as const);
          const itemId = subscriptionItemId || "unknown";

          console.log(
            `[Webhook] Marking ${tier} plan as canceled for user ${clerkUserId}`,
          );

          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "canceled",
            subscriptionItemId: itemId,
          });
          break;
        }

        case "subscriptionItem.ended": {
          console.log(`[Webhook] Subscription item ended for user ${clerkUserId}`);
          // When subscription item ends, downgrade to free
          const itemId = subscriptionItemId || "unknown";

          console.log(
            `[Webhook] Subscription item ended, downgrading user ${clerkUserId} to free`,
          );

          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier: "free",
            status: "ended",
            subscriptionItemId: itemId,
          });
          break;
        }

        case "subscriptionItem.upcoming": {
          console.log(
            `[Webhook] Subscription item upcoming for user ${clerkUserId}`,
          );
          const tier =
            planSlug === "pro" ? ("pro" as const) : ("free" as const);
          const itemId = subscriptionItemId || "unknown";

          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "upcoming",
            subscriptionItemId: itemId,
          });
          break;
        }

        case "subscriptionItem.pastDue": {
          console.log(`[Webhook] Subscription item past due for user ${clerkUserId}`);
          const tier =
            planSlug === "pro" ? ("pro" as const) : ("free" as const);
          const itemId = subscriptionItemId || "unknown";

          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "past_due",
            subscriptionItemId: itemId,
          });
          break;
        }

        case "subscriptionItem.incomplete": {
          console.log(`[Webhook] Subscription item incomplete for user ${clerkUserId}`);
          const tier =
            planSlug === "pro" ? ("pro" as const) : ("free" as const);
          const itemId = subscriptionItemId || "unknown";

          await ctx.runMutation(internal.subscriptions.updateUserSubscription, {
            clerkUserId,
            tier,
            status: "incomplete",
            subscriptionItemId: itemId,
          });
          break;
        }

        case "subscriptionItem.freeTrialEnding": {
          console.log(
            `[Webhook] Free trial ending for user ${clerkUserId}`,
          );
          // Don't change tier, just log
          break;
        }

        case "subscriptionItem.abandoned": {
          console.log(`[Webhook] Subscription item abandoned for user ${clerkUserId}`);
          // Item was abandoned (e.g., user chose different plan)
          // Don't update, just acknowledge
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
