import Stripe from "stripe";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature error:", err);

    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    );
  }

  await connectDB();

  try {
    switch (event.type) {
      // 🔥 COMPRA COMPLETADA
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const tenantId = session.metadata?.tenantId;

        if (!tenantId) break;

        await Tenant.findByIdAndUpdate(tenantId, {
          plan: "pro",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        });

        break;
      }

      // 🔥 CANCELACIÓN TOTAL
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;

        await Tenant.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          {
            plan: "free",
            stripeSubscriptionId: null,
          }
        );

        break;
      }

      // 🔥 CANCELACIÓN AL FINAL DEL PERÍODO
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;

        await Tenant.findOneAndUpdate(
          { stripeSubscriptionId: sub.id },
          {
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          }
        );

        break;
      }

      default:
        // opcional: loggear otros eventos
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);

    return NextResponse.json(
      { error: "Webhook handler error" },
      { status: 500 }
    );
  }
}