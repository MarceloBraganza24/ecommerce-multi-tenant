import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireTenantAdmin } from "@/lib/admin-session";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";

type Context = {
  params: Promise<{ store: string }>;
};

export async function GET(req: NextRequest, context: Context) {
  const { store } = await context.params;
  const { tenant } = await requireTenantAdmin(store);

  await connectDB();

  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const start = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);
  const end = to ? new Date(to) : new Date();

  const events = await AnalyticsEvent.find({
    tenantId: tenant._id,
    createdAt: { $gte: start, $lte: end },
  })
    .sort({ createdAt: -1 })
    .lean();

  const rows = [
    ["fecha", "evento", "path", "producto", "pedido", "valor"].join(","),
    ...events.map((event) =>
      [
        event.createdAt?.toISOString(),
        event.event,
        event.path || "",
        event.productTitle || "",
        event.publicCode || "",
        event.value || 0,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="analytics-${store}.csv"`,
    },
  });
}