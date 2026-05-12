import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
//import { signIn } from "@/../auth";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { AdminUser } from "@/models/AdminUser";
import { templates, TemplateId } from "@/lib/templates";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, slug, email, password, templateId } = body;

    if (!name || !slug || !email || !password) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingTenant = await Tenant.findOne({ slug });

    if (existingTenant) {
      return NextResponse.json(
        { error: "Esa URL ya está en uso" },
        { status: 409 }
      );
    }

    const selectedTemplate =
      templateId && templateId in templates
        ? templates[templateId as TemplateId]
        : templates.minimal;

    const tenant = await Tenant.create({
      name,
      slug,
      logoText: name,
      whatsapp: process.env.WHATSAPP_ADMIN_TO || "0000000000",
      plan: "free",
      social: {
        instagram: "",
        facebook: "",
      },
      builder: {
        homeSections: selectedTemplate.homeSections,
        footer: selectedTemplate.footer,
      },
    });

    const passwordHash = await bcrypt.hash(password, 12);

    await AdminUser.create({
      tenantId: tenant._id,
      tenantSlug: slug,
      name,
      email: String(email).toLowerCase().trim(),
      passwordHash,
      role: "tenant_admin",
      active: true,
    });

    return NextResponse.json({
      ok: true,
      adminUrl: `/${slug}/admin`,
      storeUrl: `/${slug}`,
    });
  } catch (error) {
    console.error("POST /api/tenants/create error:", error);

    return NextResponse.json(
      { error: "Error creando tienda" },
      { status: 500 }
    );
  }
}