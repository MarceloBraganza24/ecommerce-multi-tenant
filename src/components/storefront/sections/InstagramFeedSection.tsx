import Image from "next/image";
import { InstagramItem, SectionPropValue } from "@/types/builder";

type Props = {
  title?: SectionPropValue;
  subtitle?: SectionPropValue;
  handle?: SectionPropValue;
  items?: SectionPropValue;
};

function isInstagramItems(
  value: SectionPropValue | undefined
): value is InstagramItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "image" in item &&
        "caption" in item
    )
  );
}

export function InstagramFeedSection({
  title,
  subtitle,
  handle,
  items,
}: Props) {
  const safeTitle = typeof title === "string" ? title : "Seguinos en Instagram";

  const safeSubtitle =
    typeof subtitle === "string"
      ? subtitle
      : "Inspiración, novedades y productos destacados.";

  const safeHandle = typeof handle === "string" ? handle : "@tu_tienda";

  const safeItems = isInstagramItems(items)
    ? items
    : [
        { image: "", caption: "Nuevo producto" },
        { image: "", caption: "Inspiración" },
        { image: "", caption: "Detrás de escena" },
        { image: "", caption: "Promos" },
      ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-950">{safeTitle}</h2>
          <p className="mt-2 text-gray-600">{safeSubtitle}</p>
        </div>

        <p className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
          {safeHandle}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {safeItems.slice(0, 4).map((item, index) => (
          <div
            key={`${item.caption}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-3xl bg-gray-100"
          >
            {item.image ? (
              <Image
                src={item.image}
                alt={item.caption}
                fill
                className="object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-400">
                Imagen
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4">
              <p className="text-xs font-medium text-white">{item.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}