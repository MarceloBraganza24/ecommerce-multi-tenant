import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const host = searchParams.get("host");

  if (!host) {
    return NextResponse.json({ error: "No host" }, { status: 400 });
  }

  await connectDB();

  const tenant = await Tenant.findOne({ customDomain: host });

  return NextResponse.json({
    slug: tenant?.slug || null,
  });
}