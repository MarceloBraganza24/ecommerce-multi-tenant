import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { requireTenantAdmin } from "@/lib/adminAuth";
import { Tenant } from "@/models/Tenant";
import { CustomDomainCard } from "@/components/admin/domain/CustomDomainCard";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function AdminDomainPage({ params }: Props) {
  const { store } = await params;

  await requireTenantAdmin(store);
  await connectDB();

  const tenant = await Tenant.findOne({ slug: store }).lean();

  if (!tenant) {
    notFound();
  }

  const safeTenant = JSON.parse(JSON.stringify(tenant));

  return (
    <div className="space-y-8 p-6 md:p-8">
      <CustomDomainCard
        store={store}
        initialDomain={safeTenant.customDomain || ""}
        initialVerified={Boolean(safeTenant.domainVerified)}
        initialDns={safeTenant.domainDns || null}
      />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-gray-950">
          Cómo funciona
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-gray-50 p-4">
            <strong>1. Agregás el dominio</strong>
            <p className="mt-2 text-sm text-gray-500">
              Lo registramos automáticamente en Vercel.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <strong>2. Configurás DNS</strong>
            <p className="mt-2 text-sm text-gray-500">
              Tu cliente agrega el A record o CNAME en su proveedor.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <strong>3. Verificás</strong>
            <p className="mt-2 text-sm text-gray-500">
              Si está OK, lo activamos en Edge Config para resolver la tienda.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}