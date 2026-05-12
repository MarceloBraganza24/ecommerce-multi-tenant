import { NextResponse } from "next/server";
import { Tenant } from "@/models/Tenant";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/../auth";
import { TemplateId, templates } from "@/lib/templates";

function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === "string" && value in templates;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const templateId = body.templateId;

    if (!isTemplateId(templateId)) {
      return NextResponse.json(
        { error: "Template inválido" },
        { status: 400 }
      );
    }

    const template = templates[templateId];

    await Tenant.findByIdAndUpdate(session.user.tenantId, {
      $set: {
        "builder.homeSections": template.homeSections,
        "builder.footer": template.footer,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/templates/apply error:", error);

    return NextResponse.json(
      { error: "Error aplicando template" },
      { status: 500 }
    );
  }
}