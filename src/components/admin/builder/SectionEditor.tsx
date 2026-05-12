"use client";

import {
  FaqItem,
  HomeSection,
  SectionPropValue,
} from "@/types/builder";
import { sectionSchemas } from "@/lib/builder/sectionSchemas";

type Props = {
  section: HomeSection | null;
  onChange: (
    sectionId: string,
    fieldName: string,
    value: SectionPropValue
  ) => void;
};

function toInputValue(value: unknown): string | number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return value;
  return "";
}

function toFaqItems(value: SectionPropValue | undefined): FaqItem[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is FaqItem =>
      typeof item === "object" &&
      item !== null &&
      "question" in item &&
      "answer" in item
  );
}

export function SectionEditor({ section, onChange }: Props) {
  if (!section) {
    return (
      <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
        Seleccioná una sección para editarla.
      </div>
    );
  }

  const schema = sectionSchemas[section.type];
  const sectionId = section.id;

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-950">
          Editar sección: {section.type}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Modificá textos, imágenes y contenido.
        </p>
      </div>

      <div className="space-y-5">
        {schema.map((field) => {
          const value = section.props?.[field.name];

          if (field.type === "faq-list") {
            const items = toFaqItems(value);

            function updateFaqItem(
              index: number,
              key: keyof FaqItem,
              nextValue: string
            ) {
              const nextItems = items.map((item, itemIndex) =>
                itemIndex === index
                  ? {
                      ...item,
                      [key]: nextValue,
                    }
                  : item
              );

              onChange(sectionId, field.name, nextItems);
            }

            function addFaqItem() {
              onChange(sectionId, field.name, [
                ...items,
                {
                  question: "Nueva pregunta",
                  answer: "Nueva respuesta",
                },
              ]);
            }

            function removeFaqItem(index: number) {
              onChange(
                sectionId,
                field.name,
                items.filter((_, itemIndex) => itemIndex !== index)
              );
            }

            return (
              <div key={field.name}>
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>

                  <button
                    type="button"
                    onClick={addFaqItem}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold hover:bg-gray-50"
                  >
                    Agregar pregunta
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="space-y-3 rounded-2xl border border-gray-200 p-4"
                    >
                      <input
                        value={item.question}
                        onChange={(e) =>
                          updateFaqItem(index, "question", e.target.value)
                        }
                        placeholder="Pregunta"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
                      />

                      <textarea
                        value={item.answer}
                        onChange={(e) =>
                          updateFaqItem(index, "answer", e.target.value)
                        }
                        placeholder="Respuesta"
                        rows={3}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
                      />

                      <button
                        type="button"
                        onClick={() => removeFaqItem(index)}
                        className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Eliminar pregunta
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.name}>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {field.label}
                </label>

                <textarea
                  value={toInputValue(value)}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    onChange(sectionId, field.name, e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
                />
              </div>
            );
          }

          return (
            <div key={field.name}>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {field.label}
              </label>

              <input
                type={field.type === "number" ? "number" : "text"}
                value={toInputValue(value)}
                placeholder={field.placeholder}
                onChange={(e) =>
                  onChange(
                    sectionId,
                    field.name,
                    field.type === "number"
                      ? Number(e.target.value)
                      : e.target.value
                  )
                }
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}