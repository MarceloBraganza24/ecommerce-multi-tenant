import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { getTenantBySlug } from "@/lib/tenants";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import type { AnalyticsPayload } from "@/types/store";

const SID_COOKIE = "mt_sid";

function getUtmFromRequest(req: NextRequest) {
  return {
    source: req.headers.get("x-utm-source") || undefined,
    medium: req.headers.get("x-utm-medium") || undefined,
    campaign: req.headers.get("x-utm-campaign") || undefined,
    term: req.headers.get("x-utm-term") || undefined,
    content: req.headers.get("x-utm-content") || undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = (await req.json()) as AnalyticsPayload;

    if (!body.tenantSlug || !body.event) {
      return NextResponse.json(
        { error: "Faltan tenantSlug o event" },
        { status: 400 }
      );
    }

    const tenant = await getTenantBySlug(body.tenantSlug);

    if (!tenant) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get(SID_COOKIE)?.value;

    if (!sessionId) {
      sessionId = randomUUID();

      cookieStore.set(SID_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    await AnalyticsEvent.create({
      tenantId: tenant._id,
      tenantSlug: body.tenantSlug,
      event: body.event,
      sessionId,
      path: body.path,
      referrer: body.referrer,
      productId: body.productId,
      productSlug: body.productSlug,
      productTitle: body.productTitle,
      orderId: body.orderId,
      publicCode: body.publicCode,
      value: body.value || 0,
      currency: body.currency || "ARS",
      utm: getUtmFromRequest(req),
      metadata: body.metadata || {},
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Analytics track error:", error);

    return NextResponse.json(
      { error: "No se pudo guardar analytics" },
      { status: 500 }
    );
  }
}