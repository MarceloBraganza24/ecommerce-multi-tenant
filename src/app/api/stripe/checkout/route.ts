import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/../auth";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "No auth" }, { status: 401 });
  }

  await connectDB();

  const tenant = await Tenant.findById(session.user.tenantId);

  if (!tenant) {
    return NextResponse.json({ error: "No tenant" });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",

    customer_email: session.user.email!,

    line_items: [
      {
        price: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
        quantity: 1,
      },
    ],

    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${tenant.slug}/admin?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${tenant.slug}/admin?cancel=1`,

    metadata: {
      tenantId: String(tenant._id),
    },
  });

  return NextResponse.json({
    url: checkout.url,
  });
}