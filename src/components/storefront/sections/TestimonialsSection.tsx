import { SectionPropValue, TestimonialItem } from "@/types/builder";

type Props = {
  title?: SectionPropValue;
  subtitle?: SectionPropValue;
  items?: SectionPropValue;
};

function isTestimonials(
  value: SectionPropValue | undefined
): value is TestimonialItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "name" in item &&
        "text" in item &&
        "detail" in item
    )
  );
}

export function TestimonialsSection({ title, subtitle, items }: Props) {
  const safeTitle =
    typeof title === "string" ? title : "Lo que dicen nuestros clientes";

  const safeSubtitle =
    typeof subtitle === "string"
      ? subtitle
      : "Experiencias reales de personas que ya compraron.";

  const safeItems = isTestimonials(items)
    ? items
    : [
        {
          name: "Cliente feliz",
          text: "La experiencia de compra fue excelente.",
          detail: "Compra verificada",
        },
      ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <div className="mb-8 max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-950">{safeTitle}</h2>
        <p className="mt-2 text-gray-600">{safeSubtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {safeItems.map((item, index) => (
          <article
            key={`${item.name}-${index}`}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <p className="text-sm leading-6 text-gray-600">“{item.text}”</p>

            <div className="mt-5">
              <p className="font-semibold text-gray-950">{item.name}</p>
              <p className="text-xs text-gray-400">{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}