"use client";

import { useState } from "react";
import { HomeSectionType } from "@/types/builder";

type Props = {
  onAdd: (type: HomeSectionType) => void;
};

const availableSections: {
  type: HomeSectionType;
  title: string;
  description: string;
  emoji: string;
}[] = [
  {
    type: "hero",
    title: "Hero",
    description: "Sección principal con título, imagen y CTA.",
    emoji: "🏠",
  },
  {
    type: "products",
    title: "Productos",
    description: "Grid de productos destacados.",
    emoji: "📦",
  },
  {
    type: "banner",
    title: "Banner",
    description: "Bloque promocional con llamada a la acción.",
    emoji: "🔥",
  },
  {
    type: "faq",
    title: "FAQ",
    description: "Preguntas frecuentes editables.",
    emoji: "❓",
  },
  {
    type: "testimonials",
    title: "Testimonios",
    description: "Prueba social para aumentar confianza.",
    emoji: "💬",
  },
  {
    type: "newsletter",
    title: "Newsletter",
    description: "Captura emails de clientes.",
    emoji: "✉️",
  },
  {
    type: "instagram",
    title: "Instagram",
    description: "Feed visual de inspiración y contenido.",
    emoji: "📸",
  },
];

export function AddSectionButton({ onAdd }: Props) {
  const [open, setOpen] = useState(false);

  function handleAdd(type: HomeSectionType) {
    onAdd(type);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-4 text-sm font-semibold text-gray-700 transition hover:border-gray-950 hover:text-gray-950"
      >
        + Agregar sección
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-3 max-h-[480px] overflow-y-auto rounded-3xl border border-gray-200 bg-white p-3 shadow-xl">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-gray-950">
              Agregar bloque
            </p>
            <p className="text-xs text-gray-500">
              Elegí una sección para sumar a la home.
            </p>
          </div>

          <div className="space-y-2">
            {availableSections.map((section) => (
              <button
                key={section.type}
                type="button"
                onClick={() => handleAdd(section.type)}
                className="w-full rounded-2xl border border-gray-100 p-3 text-left transition hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-xl">
                    {section.emoji}
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-gray-950">
                      {section.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-gray-500">
                      {section.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}