import Link from "next/link";

type Props = {
  title?: string;
  subtitle?: string;
  limit?: number;
};

export function ProductGridSection({
  title = "Productos destacados",
  subtitle = "Los más elegidos por nuestros clientes.",
  limit = 8,
}: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-950">{title}</h2>
          <p className="mt-2 text-gray-600">{subtitle}</p>
        </div>

        <Link
          href="/products"
          className="text-sm font-semibold text-gray-950 underline-offset-4 hover:underline"
        >
          Ver todos
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: Number(limit) || 8 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="aspect-square rounded-2xl bg-gray-100" />

            <div className="mt-4">
              <p className="font-semibold text-gray-950">
                Producto destacado
              </p>
              <p className="mt-1 text-sm text-gray-500">$0</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}