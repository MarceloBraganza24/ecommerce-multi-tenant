import { Category } from "@/models/Category";
import { connectDB } from "@/lib/mongodb";
import { requireTenantAdmin } from "@/lib/admin-session";
import { createCategoryAction } from "../actions";
import type { MongoCategory } from "@/types/store";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function AdminCategoriesPage({ params }: Props) {
  const { store } = await params;
  const { tenant } = await requireTenantAdmin(store);

  await connectDB();

  const categories = (await Category.find({ tenantId: tenant._id })
    .sort({ name: 1 })
    .lean()) as MongoCategory[];

  return (
    <div>
      <div className="adminHeader">
        <div>
          <span className="eyebrow">Categorías</span>
          <h1>Gestionar categorías</h1>
        </div>
      </div>

      <form
        className="adminForm compact"
        action={createCategoryAction.bind(null, store)}
      >
        <label>
          Nombre
          <input name="name" required />
        </label>

        <label>
          Slug
          <input name="slug" required />
        </label>

        <label>
          Categoría padre
          <select name="parentId">
            <option value="">Sin padre</option>
            {categories.map((category) => (
              <option key={String(category._id)} value={String(category._id)}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Imagen
          <input name="image" />
        </label>

        <button className="adminPrimaryButton" type="submit">
          Crear categoría
        </button>
      </form>

      <div className="adminTableCard">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Padre</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => {
              const parent = categories.find(
                (item) => String(item._id) === String(category.parentId)
              );

              return (
                <tr key={String(category._id)}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{parent?.name || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}