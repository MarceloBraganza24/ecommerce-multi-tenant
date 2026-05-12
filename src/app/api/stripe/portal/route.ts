import Stripe from "stripe";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/../auth";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    await connectDB();

    const tenant = await Tenant.findById(session.user.tenantId);

    if (!tenant?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No hay suscripción" },
        { status: 400 }
      );
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: tenant.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${tenant.slug}/admin`,
    });

    return NextResponse.json({
      url: portal.url,
    });
  } catch (error) {
    console.error("Stripe portal error:", error);

    return NextResponse.json(
      { error: "Error creando portal" },
      { status: 500 }
    );
  }
}