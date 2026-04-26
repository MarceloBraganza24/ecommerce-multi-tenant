import { NextRequest, NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/tenants";
import { getShippingQuote } from "@/lib/shipping";

type Context = {
  params: Promise<{ store: string }>;
};

export async function POST(req: NextRequest, context: Context) {
  try {
    const { store } = await context.params;
    const tenant = await getTenantBySlug(store);

    if (!tenant) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 });
    }

    const body = await req.json();

    const quote = await getShippingQuote({
      tenant,
      itemsTotal: Number(body.itemsTotal || 0),
      postalCodeDestination: body.postalCodeDestination,
      deliveryType: body.deliveryType,
    });

    return NextResponse.json({ quote });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo cotizar envío",
      },
      { status: 400 }
    );
  }
}