import { createProductAction } from "../../actions";
import { ImageUploader } from "@/components/admin/ImageUploader";

type Props = {
  params: Promise<{ store: string }>;
};

export default async function NewProductPage({
  params,
}: Props) {
  const { store } = await params;

  return (
    <div>
      <div className="adminHeader">
        <div>
          <span className="eyebrow">
            Nuevo producto
          </span>

          <h1>Cargar producto</h1>
        </div>
      </div>

      <form
        className="adminForm"
        action={createProductAction.bind(
          null,
          store
        )}
      >
        <ProductFields store={store} />

        <button
          className="adminPrimaryButton"
          type="submit"
        >
          Guardar producto
        </button>
      </form>
    </div>
  );
}

type ProductFieldsProps = {
  store: string;
};

function ProductFields({
  store,
}: ProductFieldsProps) {
  return (
    <>
      <label>
        Título
        <input name="title" required />
      </label>

      <label>
        Slug
        <input
          name="slug"
          required
          placeholder="zapatillas-running"
        />
      </label>

      <label>
        Descripción
        <textarea name="description" />
      </label>

      <label>
        Precio
        <input
          name="price"
          type="number"
          required
        />
      </label>

      <label>
        Precio anterior
        <input
          name="compareAtPrice"
          type="number"
        />
      </label>

      <label>
        Marca
        <input name="brand" />
      </label>

      <label>
        Slug categoría
        <input
          name="categorySlug"
          required
          placeholder="zapatillas"
        />
      </label>

      <ImageUploader
        store={store}
        name="images"
        label="Imágenes"
      />

      <label>
        Stock
        <input
          name="stock"
          type="number"
          defaultValue={0}
        />
      </label>

      <label>
        Propiedades JSON
        <textarea
          name="properties"
          defaultValue={`{
  "sexo": "Unisex",
  "talle": "M",
  "color": "Negro",
  "deporte": "Running",
  "modelo": "Ultraboost",
  "descuento": "20%"
}`}
        />
      </label>

      <div className="adminCheckboxes">
        <label>
          <input
            name="featured"
            type="checkbox"
          />
          {" "}Destacado
        </label>

        <label>
          <input
            name="offer"
            type="checkbox"
          />
          {" "}Oferta
        </label>
      </div>
    </>
  );
}