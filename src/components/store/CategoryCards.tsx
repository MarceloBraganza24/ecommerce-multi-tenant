import { Category } from "@/types/store";

type Props = {
  categories: Category[];
  store: string;
};

export function CategoryCards({ categories, store }: Props) {
  if (!categories.length) return null;

  return (
    <section className="categorySection">
      <div className="sectionHeader">
        <h2>Comprá por categoría</h2>
        <a href={`/${store}/productos`}>Ver productos</a>
      </div>

      <div className="categoryGrid">
        {categories.map((category) => (
          <a
            key={category._id}
            href={`/${store}/productos?categoria=${category.slug}`}
            className="categoryCard"
          >
            <div className="categoryImage">
              {category.image ? <img src={category.image} alt={category.name} /> : null}
            </div>

            <h3>{category.name}</h3>
            <span>Ver categoría →</span>
          </a>
        ))}
      </div>
    </section>
  );
}