import { FaqItem, SectionPropValue } from "@/types/builder";

type Props = {
  title?: SectionPropValue;
  items?: SectionPropValue;
};

function isFaqItems(value: SectionPropValue | undefined): value is FaqItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "question" in item &&
        "answer" in item
    )
  );
}

export function FaqSection({ title, items }: Props) {
  const safeTitle = typeof title === "string" ? title : "Preguntas frecuentes";

  const safeItems = isFaqItems(items)
    ? items
    : [
        {
          question: "¿Hacen envíos?",
          answer: "Sí, hacemos envíos a todo el país.",
        },
      ];

  return (
    <section className="mx-auto max-w-4xl px-4 py-14 md:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-950">{safeTitle}</h2>
      </div>

      <div className="space-y-4">
        {safeItems.map((item, index) => (
          <div
            key={`${item.question}-${index}`}
            className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h3 className="font-semibold text-gray-950">{item.question}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}