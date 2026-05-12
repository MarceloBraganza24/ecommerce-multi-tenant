import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { AdminUser } from "@/models/AdminUser";

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "No disponible en producción" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const { setupSecret, store, name, email, password } = body;

    if (!process.env.DEV_SETUP_SECRET) {
      return NextResponse.json(
        { error: "Falta DEV_SETUP_SECRET" },
        { status: 500 }
      );
    }

    if (setupSecret !== process.env.DEV_SETUP_SECRET) {
      return NextResponse.json(
        { error: "setupSecret incorrecto" },
        { status: 401 }
      );
    }

    if (!store || !name || !email || !password) {
      return NextResponse.json(
        { error: "Faltan datos: store, name, email, password" },
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

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedStore = String(store).trim();

    const tenant = await Tenant.findOne({ slug: normalizedStore });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    const admin = await AdminUser.findOneAndUpdate(
      {
        email: normalizedEmail,
        tenantId: tenant._id,
      },
      {
        $set: {
          name: String(name).trim(),
          passwordHash,
          active: true,
        },
        $setOnInsert: {
          tenantId: tenant._id,
          tenantSlug: tenant.slug,
          email: normalizedEmail,
          role: "tenant_admin",
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return NextResponse.json({
      ok: true,
      admin: {
        id: String(admin._id),
        name: admin.name,
        email: admin.email,
        tenantSlug: admin.tenantSlug,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("POST /api/dev/create-admin error:", error);

    return NextResponse.json(
      { error: "Error creando admin" },
      { status: 500 }
    );
  }
}