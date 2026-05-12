"use client";

import { BuilderFooter, FooterLink } from "@/types/builder";

type Props = {
  footer: BuilderFooter;
  onChange: (footer: BuilderFooter) => void;
};

export function FooterEditor({ footer, onChange }: Props) {
  function updateField<K extends keyof BuilderFooter>(
    key: K,
    value: BuilderFooter[K]
  ) {
    onChange({
      ...footer,
      [key]: value,
    });
  }

  function updateLink(index: number, field: keyof FooterLink, value: string) {
    const nextLinks = footer.links.map((link, linkIndex) =>
      linkIndex === index
        ? {
            ...link,
            [field]: value,
          }
        : link
    );

    updateField("links", nextLinks);
  }

  function addLink() {
    updateField("links", [
      ...footer.links,
      {
        label: "Nuevo link",
        href: "/",
      },
    ]);
  }

  function removeLink(index: number) {
    updateField(
      "links",
      footer.links.filter((_, linkIndex) => linkIndex !== index)
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-950">Footer editable</h2>
          <p className="mt-1 text-sm text-gray-500">
            Configurá el pie de página de la tienda.
          </p>
        </div>

        <button
          type="button"
          onClick={() => updateField("enabled", !footer.enabled)}
          className={`rounded-full px-4 py-2 text-xs font-semibold ${
            footer.enabled
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {footer.enabled ? "ON" : "OFF"}
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <textarea
            value={footer.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Texto legal
          </label>
          <input
            value={footer.legalText}
            onChange={(e) => updateField("legalText", e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Links del footer
            </label>

            <button
              type="button"
              onClick={addLink}
              className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold hover:bg-gray-50"
            >
              Agregar link
            </button>
          </div>

          <div className="space-y-3">
            {footer.links.map((link, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl border border-gray-200 p-3 md:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  value={link.label}
                  onChange={(e) =>
                    updateLink(index, "label", e.target.value)
                  }
                  placeholder="Texto"
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
                />

                <input
                  value={link.href}
                  onChange={(e) => updateLink(index, "href", e.target.value)}
                  placeholder="/productos"
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-950"
                />

                <button
                  type="button"
                  onClick={() => removeLink(index)}
                  className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}