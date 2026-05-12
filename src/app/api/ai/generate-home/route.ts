import OpenAI from "openai";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { BuilderFooter, HomeSection } from "@/types/builder";
import { getServerSession } from "next-auth";
import { authOptions } from "@/../auth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type AiHomeResult = {
  homeSections: HomeSection[];
  footer: BuilderFooter;
};

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    homeSections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          type: {
            type: "string",
            enum: [
              "hero",
              "products",
              "banner",
              "faq",
              "testimonials",
              "newsletter",
              "instagram",
            ],
          },
          enabled: { type: "boolean" },
          order: { type: "number" },
          props: {
            type: "object",
            additionalProperties: true,
          },
        },
        required: ["id", "type", "enabled", "order", "props"],
      },
    },
    footer: {
      type: "object",
      additionalProperties: false,
      properties: {
        enabled: { type: "boolean" },
        description: { type: "string" },
        legalText: { type: "string" },
        links: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              label: { type: "string" },
              href: { type: "string" },
            },
            required: ["label", "href"],
          },
        },
      },
      required: ["enabled", "description", "legalText", "links"],
    },
  },
  required: ["homeSections", "footer"],
} as const;

function normalizeAiHome(result: AiHomeResult): AiHomeResult {
  return {
    homeSections: result.homeSections.map((section, index) => ({
      ...section,
      id: section.id || `${section.type}-${index + 1}`,
      enabled: true,
      order: index + 1,
      props: section.props || {},
    })),
    footer: {
      enabled: result.footer.enabled,
      description: result.footer.description,
      legalText: result.footer.legalText,
      links: result.footer.links || [],
    },
  };
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const prompt = String(body.prompt || "").trim();

    if (prompt.length < 10) {
      return NextResponse.json(
        { error: "Describí un poco mejor la tienda que querés crear." },
        { status: 400 }
      );
    }

    await connectDB();

    const tenant = await Tenant.findById(session.user.tenantId);

    if (!tenant) {
      return NextResponse.json(
        { error: "Tienda no encontrada" },
        { status: 404 }
      );
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "Sos un experto en ecommerce, CRO y copywriting. Generás una home para una tienda online multi-tenant. Devolvés secciones listas para renderizar. Usá español argentino, textos claros, orientados a venta y confianza.",
        },
        {
          role: "user",
          content: `Generá una home para esta idea de tienda: ${prompt}

Reglas:
- Crear entre 5 y 7 secciones.
- Siempre incluir hero, products, faq.
- Podés incluir banner, testimonials, newsletter, instagram.
- ctaLink usar siempre "/productos" o "/contacto".
- No inventes URLs de imágenes reales: dejá image vacío.
- Para products usar limit 8.
- Para FAQ usar 3 preguntas.
- Para testimonials usar 3 testimonios realistas.
- Para instagram usar 4 items con image vacío.
- El footer debe tener links a /productos y /contacto.`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "generated_home",
          strict: true,
          schema,
        },
      },
    });

    const text = response.output_text;

    const parsed = JSON.parse(text) as AiHomeResult;
    const normalized = normalizeAiHome(parsed);

    await Tenant.findByIdAndUpdate(session.user.tenantId, {
      $set: {
        "builder.homeSections": normalized.homeSections,
        "builder.footer": normalized.footer,
      },
    });

    return NextResponse.json({
      ok: true,
      homeSections: normalized.homeSections,
      footer: normalized.footer,
    });
  } catch (error) {
    console.error("POST /api/ai/generate-home error:", error);

    return NextResponse.json(
      { error: "Error generando home con IA" },
      { status: 500 }
    );
  }
}