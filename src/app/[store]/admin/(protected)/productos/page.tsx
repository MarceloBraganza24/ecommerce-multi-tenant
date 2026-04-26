import { Product } from "@/models/Product";
import { connectDB } from "@/lib/mongodb";
import { requireTenantAdmin } from "@/lib/admin-session";
import { deleteProductAction } from "../actions";
import type { MongoProduct } from "@/types/store";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function AdminProductsPage({ params }: Props) {
  const { store } = await params;
  const { tenant } = await requireTenantAdmin(store);

  await connectDB();

  const products = (await Product.find({ tenantId: tenant._id })
    .sort({ createdAt: -1 })
    .lean()) as MongoProduct[];

  return (
    <div>
      <div className="adminHeader">
        <div>
          <span className="eyebrow">Productos</span>
          <h1>Gestionar productos</h1>
        </div>

        <a className="adminPrimaryButton" href={`/${store}/admin/productos/nuevo`}>
          Nuevo producto
        </a>
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
                  <a href={`/${store}/admin/productos/${product._id}/editar`}>
                    Editar
                  </a>

                  <form action={deleteProductAction.bind(null, store, String(product._id))}>
                    <button type="submit">Ocultar</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}