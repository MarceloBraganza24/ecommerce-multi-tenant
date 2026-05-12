import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireTenantAdmin } from "@/lib/adminAuth";
import { Tenant } from "@/models/Tenant";
import {
  isValidCustomDomain,
  normalizeHost,
} from "@/lib/domainKeys";
import {
  addDomainToVercelProject,
  getDnsInstructions,
  getVercelProjectDomain,
  verifyVercelProjectDomain,
} from "@/lib/vercelDomains";
import { upsertDomainInEdgeConfig } from "@/lib/edgeConfigAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const store = String(body.store || "").trim();
    const domain = normalizeHost(String(body.domain || ""));

    if (!store) {
      return NextResponse.json({ error: "Falta store" }, { status: 400 });
    }

    if (!isValidCustomDomain(domain)) {
      return NextResponse.json(
        { error: "Dominio inválido" },
        { status: 400 }
      );
    }

    await requireTenantAdmin(store);
    await connectDB();

    const existingDomainTenant = await Tenant.findOne({
      customDomain: domain,
      slug: { $ne: store },
    }).lean();

    if (existingDomainTenant) {
      return NextResponse.json(
        { error: "Ese dominio ya está conectado a otra tienda" },
        { status: 409 }
      );
    }

    const tenant = await Tenant.findOne({ slug: store });

    if (!tenant) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    let vercelDomain;

    try {
      vercelDomain = await addDomainToVercelProject(domain);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error agregando dominio";

      if (!message.toLowerCase().includes("already")) {
        throw error;
      }

      vercelDomain = await getVercelProjectDomain(domain);
    }

    const dns = getDnsInstructions(domain);

    await Tenant.updateOne(
      { _id: tenant._id },
      {
        $set: {
          customDomain: domain,
          domainVerified: Boolean(vercelDomain.verified),
          domainStatus: vercelDomain.verified ? "verified" : "pending",
          domainDns: dns,
          domainLastCheckedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      ok: true,
      domain,
      verified: Boolean(vercelDomain.verified),
      dns,
      verification: vercelDomain.verification || [],
    });
  } catch (error) {
    console.error("DOMAIN POST ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo conectar el dominio",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    const store = String(body.store || "").trim();

    if (!store) {
      return NextResponse.json({ error: "Falta store" }, { status: 400 });
    }

    await requireTenantAdmin(store);
    await connectDB();

    const tenant = await Tenant.findOne({ slug: store });

    if (!tenant || !tenant.customDomain) {
      return NextResponse.json(
        { error: "No hay dominio configurado" },
        { status: 404 }
      );
    }

    const domain = normalizeHost(String(tenant.customDomain));

    let vercelDomain = await verifyVercelProjectDomain(domain);

    if (!vercelDomain.verified) {
      vercelDomain = await getVercelProjectDomain(domain);
    }

    const verified = Boolean(vercelDomain.verified);

    if (verified) {
      await upsertDomainInEdgeConfig(domain, store);
    }

    await Tenant.updateOne(
      { _id: tenant._id },
      {
        $set: {
          domainVerified: verified,
          domainStatus: verified ? "verified" : "pending",
          domainLastCheckedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      ok: true,
      domain,
      verified,
      verification: vercelDomain.verification || [],
    });
  } catch (error) {
    console.error("DOMAIN PATCH ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo verificar el dominio",
      },
      { status: 500 }
    );
  }
}