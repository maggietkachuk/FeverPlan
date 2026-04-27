import type { Express, Request, Response } from "express";
import Stripe from "stripe";
import { activateSubscription } from "./db";
import { getPlanEndDate } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});

export function registerStripeWebhook(app: Express) {
  // MUST use express.raw() BEFORE express.json() for signature verification
  app.post(
    "/api/stripe/webhook",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req: any, res: Response, next: any) => {
      // Apply raw body parsing only for this route
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", () => {
        req.rawBody = Buffer.concat(chunks);
        next();
      });
    },
    async (req: Request & { rawBody?: Buffer }, res: Response) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !webhookSecret) {
        console.warn("[Webhook] Missing stripe-signature or webhook secret");
        return res.status(400).send("Missing signature");
      }

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody ?? Buffer.alloc(0),
          sig,
          webhookSecret
        );
      } catch (err) {
        console.error("[Webhook] Signature verification failed:", err);
        return res.status(400).send("Invalid signature");
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            if (session.payment_status === "paid") {
              const userId = parseInt(session.metadata?.user_id ?? "0");
              const planId = session.metadata?.plan_id as
                | "3day"
                | "7day"
                | "3month"
                | "annual"
                | undefined;

              if (userId && planId) {
                const endDate = getPlanEndDate(planId);
                if (endDate) {
                  await activateSubscription(
                    userId,
                    planId,
                    endDate,
                    session.customer?.toString() ?? "",
                    session.id
                  );
                  console.log(
                    `[Webhook] Subscription activated for user ${userId}, plan ${planId}`
                  );
                }
              }
            }
            break;
          }
          case "payment_intent.succeeded": {
            console.log("[Webhook] payment_intent.succeeded received");
            break;
          }
          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Webhook] Error processing event:", err);
        return res.status(500).send("Webhook processing error");
      }

      return res.json({ received: true });
    }
  );
}
