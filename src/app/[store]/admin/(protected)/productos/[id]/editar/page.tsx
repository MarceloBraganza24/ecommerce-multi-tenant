import { Product } from "@/models/Product";
import { connectDB } from "@/lib/mongodb";
import { requireTenantAdmin } from "@/lib/adminAuth";
import { updateProductAction } from "../../../actions";
import type { MongoProduct } from "@/types/store";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Tenant } from "@/models/Tenant";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ store: string; id: string }>;
};

export default async function EditProductPage({ params }: Props) {
  const { store, id } = await params;
  
  await requireTenantAdmin(store);
  
  const tenant = await Tenant.findOne({ slug: store }).lean();

  if (!tenant) {
    notFound();
  }

  const safeTenant = JSON.parse(JSON.stringify(tenant));

  await connectDB();

  const product = (await Product.findOne({
    _id: id,
    tenantId: safeTenant._id,
  }).lean()) as MongoProduct | null;

  if (!product) notFound();

  return (
    <div>
      <div className="adminHeader">
        <div>
          <span className="eyebrow">Editar producto</span>
          <h1>{product.title}</h1>
        </div>
      </div>

      <form
        className="adminForm"
        action={updateProductAction.bind(null, store, String(product._id))}
      >
        <label>
          Título
          <input name="title" defaultValue={product.title} required />
        </label>

        <label>
          Slug
          <input name="slug" defaultValue={product.slug} required />
        </label>

        <label>
          Descripción
          <textarea name="description" defaultValue={product.description} />
        </label>

        <label>
          Precio
          <input name="price" type="number" defaultValue={product.price} required />
        </label>

        <label>
          Precio anterior
          <input
            name="compareAtPrice"
            type="number"
            defaultValue={product.compareAtPrice || ""}
          />
        </label>

        <label>
          Marca
          <input name="brand" defaultValue={product.brand || ""} />
        </label>

        <label>
          Slug categoría
          <input name="categorySlug" defaultValue={product.categorySlug} required />
        </label>

        <ImageUploader
          name="images"
          label="Imágenes"
          defaultValue={product.images?.join("\n") || ""}
        />

        <label>
          Stock
          <input name="stock" type="number" defaultValue={product.stock} />
        </label>

        <label>
          Propiedades JSON
          <textarea
            name="properties"
            defaultValue={JSON.stringify(product.properties || {}, null, 2)}
          />
        </label>

        <div className="adminCheckboxes">
          <label>
            <input
              name="featured"
              type="checkbox"
              defaultChecked={Boolean(product.featured)}
            />{" "}
            Destacado
          </label>

          <label>
            <input
              name="offer"
              type="checkbox"
              defaultChecked={Boolean(product.offer)}
            />{" "}
            Oferta
          </label>

          <label>
            <input
              name="active"
              type="checkbox"
              defaultChecked={product.active !== false}
            />{" "}
            Activo
          </label>
        </div>

        <button className="adminPrimaryButton" type="submit">
          Guardar cambios
        </button>
      </form>
    </div>
  );
}