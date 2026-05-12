import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Tenant } from "@/models/Tenant";
import { getProductsByTenantId } from "@/lib/products";
import { PlanUsageBar } from "@/components/admin/PlanUsageBar";
import { deleteProductAction } from "@/actions/products";
import { MongoProduct } from "@/types/store";
import { requireTenantAdmin } from "@/lib/adminAuth";

type Props = {
  params: Promise<{
    store: string;
  }>;
};

export default async function AdminProductsPage({ params }: Props) {
  const { store } = await params;

  await requireTenantAdmin(store);

  await connectDB();

  const tenant = await Tenant.findOne({ slug: store }).lean();

  if (!tenant) return null;

  const safeTenant = JSON.parse(JSON.stringify(tenant));

  const products = (await getProductsByTenantId(
    safeTenant._id
  )) as MongoProduct[];

  const FREE_LIMIT = 10;

  const isFreeLimitReached =
    safeTenant.plan === "free" && products.length >= FREE_LIMIT;

  return (
    <>
      <PlanUsageBar
        current={products.length}
        limit={FREE_LIMIT}
        plan={safeTenant.plan}
      />

      <div>
        <div className="adminHeader">
          <div>
            <span className="eyebrow">Productos</span>
            <h1>Gestionar productos</h1>
          </div>

          <div className="text-right">
            <Link href={`/${store}/admin/productos/nuevo`}>
              <button
                disabled={isFreeLimitReached}
                className={`btn ${
                  isFreeLimitReached ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isFreeLimitReached
                  ? "Límite alcanzado 🚧"
                  : "Crear producto"}
              </button>
            </Link>

            {isFreeLimitReached && (
              <p className="mt-1 text-xs text-red-500">
                Necesitás PRO para seguir creando productos
              </p>
            )}
          </div>
        </div>

        <div className="adminTableCard">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={String(product._id)}>
                  <td>{product.title}</td>
                  <td>{product.categorySlug}</td>
                  <td>${product.price.toLocaleString("es-AR")}</td>
                  <td>{product.stock}</td>
                  <td>{product.active === false ? "Oculto" : "Activo"}</td>

                  <td className="adminActions">
                    <Link
                      href={`/${store}/admin/productos/${product._id}/editar`}
                    >
                      Editar
                    </Link>

                    <form
                      action={deleteProductAction.bind(
                        null,
                        store,
                        String(product._id)
                      )}
                    >
                      <button type="submit">Ocultar</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">
              No tenés productos todavía.
            </div>
          )}
        </div>
      </div>
    </>
  );
}