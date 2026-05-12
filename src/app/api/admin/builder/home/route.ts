import { NextResponse } from "next/server";
import { Tenant } from "@/models/Tenant";
import { defaultHomeSections } from "@/lib/builder/defaultHomeSections";
import { defaultFooter } from "@/lib/builder/defaultFooter";
import { BuilderFooter, HomeSection } from "@/types/builder";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/../auth";

function sanitizeSections(sections: HomeSection[]) {
  return sections
    .filter((section) => section.id && section.type)
    .map((section, index) => ({
      id: String(section.id),
      type: section.type,
      enabled: Boolean(section.enabled),
      order: Number(section.order ?? index + 1),
      props: section.props ?? {},
    }));
}

function sanitizeFooter(footer: BuilderFooter) {
  return {
    enabled: Boolean(footer.enabled),
    description: String(footer.description ?? ""),
    legalText: String(footer.legalText ?? ""),
    links: Array.isArray(footer.links)
      ? footer.links.map((link) => ({
          label: String(link.label ?? ""),
          href: String(link.href ?? ""),
        }))
      : [],
  };
}

async function requireApiSessionForTenant(tenantId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      ),
    };
  }

  if (session.user.tenantId !== tenantId) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "No autorizado para esta tienda" },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Falta tenantId" }, { status: 400 });
    }

    const access = await requireApiSessionForTenant(tenantId);

    if (!access.ok) {
      return access.response;
    }

    const tenant = await Tenant.findById(tenantId).lean();

    if (!tenant) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    const sections =
      tenant.builder?.homeSections?.length > 0
        ? tenant.builder.homeSections
        : defaultHomeSections;

    const footer = tenant.builder?.footer || defaultFooter;

    return NextResponse.json({
      homeSections: sections,
      footer,
    });
  } catch (error) {
    console.error("GET /api/admin/builder/home error:", error);

    return NextResponse.json(
      { error: "Error obteniendo configuración de home" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const { tenantId, homeSections, footer } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "Falta tenantId" }, { status: 400 });
    }

    const access = await requireApiSessionForTenant(String(tenantId));

    if (!access.ok) {
      return access.response;
    }

    if (!Array.isArray(homeSections)) {
      return NextResponse.json(
        { error: "homeSections debe ser un array" },
        { status: 400 }
      );
    }

    const cleanSections = sanitizeSections(homeSections);
    const cleanFooter = sanitizeFooter(footer || defaultFooter);

    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      {
        $set: {
          "builder.homeSections": cleanSections,
          "builder.footer": cleanFooter,
        },
      },
      { new: true }
    );

    if (!tenant) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      homeSections: tenant.builder.homeSections,
      footer: tenant.builder.footer,
    });
  } catch (error) {
    console.error("PATCH /api/admin/builder/home error:", error);

    return NextResponse.json(
      { error: "Error guardando home builder" },
      { status: 500 }
    );
  }
}