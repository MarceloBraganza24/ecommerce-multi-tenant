import { requireTenantAdmin } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import { AnalyticsEvent } from "@/models/AnalyticsEvent";
import { Tenant } from "@/models/Tenant";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ store: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function AdminAnalyticsPage({ params, searchParams }: Props) {
  const { store } = await params;
  const { from, to } = await searchParams;

  await requireTenantAdmin(store);
  
  const tenant = await Tenant.findOne({ slug: store }).lean();

  if (!tenant) {
    notFound();
  }

  const safeTenant = JSON.parse(JSON.stringify(tenant));

  await connectDB();

  const today = new Date();

  const defaultStart = new Date(today);
  defaultStart.setDate(defaultStart.getDate() - 30);

  const start = from ? new Date(from) : defaultStart;
  const end = to ? new Date(to) : today;

  const events = await AnalyticsEvent.find({
    tenantId: safeTenant._id,
    createdAt: { $gte: start, $lte: end },
  })
    .sort({ createdAt: -1 })
    .lean();

  const count = (name: string) => events.filter((e) => e.event === name).length;

  const pageViews = count("page_view");
  const viewProduct = count("view_product");
  const addToCart = count("add_to_cart");
  const beginCheckout = count("begin_checkout");
  const purchases = events.filter((e) => e.event === "purchase_paid");

  const revenue = purchases.reduce((acc, e) => acc + Number(e.value || 0), 0);

  const conversion = pageViews ? (purchases.length / pageViews) * 100 : 0;

  return (
    <div>
      <div className="adminHeader">
        <div>
          <span className="eyebrow">Analytics</span>
          <h1>Rendimiento</h1>
        </div>

        <a
          className="adminPrimaryButton"
          href={`/${store}/admin/analytics/export?from=${from || ""}&to=${to || ""}`}
        >
          Exportar CSV
        </a>
      </div>

      <form className="filtersBar">
        <input name="from" type="date" defaultValue={from || ""} />
        <input name="to" type="date" defaultValue={to || ""} />
        <button>Filtrar</button>
      </form>

      <section className="adminStatsGrid">
        <article>
          <span>Revenue</span>
          <strong>${revenue.toLocaleString("es-AR")}</strong>
        </article>

        <article>
          <span>Conversión</span>
          <strong>{conversion.toFixed(2)}%</strong>
        </article>

        <article>
          <span>Compras</span>
          <strong>{purchases.length}</strong>
        </article>

        <article>
          <span>Eventos</span>
          <strong>{events.length}</strong>
        </article>
      </section>

      <section className="adminTableCard analyticsCard">
        <h2>Embudo</h2>

        <div className="funnelList">
          <div><span>Page view</span><strong>{pageViews}</strong></div>
          <div><span>View product</span><strong>{viewProduct}</strong></div>
          <div><span>Add to cart</span><strong>{addToCart}</strong></div>
          <div><span>Begin checkout</span><strong>{beginCheckout}</strong></div>
          <div><span>Purchase paid</span><strong>{purchases.length}</strong></div>
        </div>
      </section>
    </div>
  );
}