import { NextRequest, NextResponse } from "next/server";
import { getShippingQuote } from "@/lib/shipping";
import { Tenant } from "@/models/Tenant";
import { connectDB } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      store,
      items = [],
      itemsTotal,
      postalCodeDestination,
      deliveryType,
    } = body;

    if (!store) {
      return NextResponse.json(
        { error: "Falta store" },
        { status: 400 }
      );
    }

    await connectDB();

    const tenant = await Tenant.findOne({ slug: store }).lean();

    if (!tenant) {
      return Response.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    const quote = await getShippingQuote({
      tenant,
      items,
      itemsTotal: Number(itemsTotal || 0),
      postalCodeDestination,
      deliveryType,
    });

    return NextResponse.json({ quote });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo cotizar envío",
      },
      { status: 400 }
    );
  }
}