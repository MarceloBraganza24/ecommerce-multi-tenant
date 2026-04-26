import { Product } from "@/types/store";

type Props = {
  product: Product;
  store: string;
};

export function ProductCard({ product, store }: Props) {
  return (
    <article className="productCard">
      <a href={`/${store}/productos/${product.slug}`}>
        <div className="productImage">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} />
          ) : null}
        </div>

        <div className="productInfo">
          {product.offer && <span className="productBadge">Oferta</span>}

          <h3>{product.title}</h3>

          <p className="productDescription">{product.description}</p>

          <div className="productPrices">
            <strong className="productPrice">
              ${product.price.toLocaleString("es-AR")}
            </strong>

            {product.compareAtPrice && (
              <span className="comparePrice">
                ${product.compareAtPrice.toLocaleString("es-AR")}
              </span>
            )}
          </div>
        </div>
      </a>
    </article>
  );
}