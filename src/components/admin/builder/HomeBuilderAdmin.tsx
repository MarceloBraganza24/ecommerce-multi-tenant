"use client";

import { useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  BuilderFooter,
  HomeSection,
  HomeSectionType,
  SectionPropValue,
} from "@/types/builder";
import { defaultHomeSections } from "@/lib/builder/defaultHomeSections";
import { defaultFooter } from "@/lib/builder/defaultFooter";
import { HomeBuilderRenderer } from "@/components/storefront/HomeBuilderRenderer";
import { BuilderFooter as StorefrontFooter } from "@/components/storefront/BuilderFooter";
import { SectionEditor } from "./SectionEditor";
import { SectionListItem } from "./SectionListItem";
import { FooterEditor } from "./FooterEditor";
import { AiHomeGenerator } from "./AiHomeGenerator";
import { createDefaultSection } from "@/lib/builder/createDefaultSection";
import { AddSectionButton } from "./AddSectionButton";

type Props = {
  tenantId: string;
  store: string;
  storeName: string;
  initialSections?: HomeSection[];
  initialFooter?: BuilderFooter;
};

export function HomeBuilderAdmin({
  tenantId,
  store,
  storeName,
  initialSections,
  initialFooter,
}: Props) {
  const [sections, setSections] = useState<HomeSection[]>(
    initialSections?.length ? initialSections : defaultHomeSections
  );

  const [footer, setFooter] = useState<BuilderFooter>(
    initialFooter || defaultFooter
  );

  const [selectedId, setSelectedId] = useState<string>(
    sections[0]?.id ?? ""
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const orderedSections = useMemo(() => {
    return [...sections].sort((a, b) => a.order - b.order);
  }, [sections]);

  const sectionIds = useMemo(() => {
    return orderedSections.map((section) => section.id);
  }, [orderedSections]);

  const selectedSection =
    sections.find((section) => section.id === selectedId) ?? null;

  function handleAddSection(type: HomeSectionType) {
    setSections((prev) => {
      const nextOrder = prev.length + 1;
      const newSection = createDefaultSection(type, nextOrder);

      setSelectedId(newSection.id);

      return normalizeOrder([...prev, newSection]);
    });
  }

  function normalizeOrder(nextSections: HomeSection[]) {
    return nextSections.map((section, index) => ({
      ...section,
      order: index + 1,
    }));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;
    if (active.id === over.id) return;

    setSections((prev) => {
      const ordered = [...prev].sort((a, b) => a.order - b.order);

      const oldIndex = ordered.findIndex(
        (section) => section.id === active.id
      );

      const newIndex = ordered.findIndex(
        (section) => section.id === over.id
      );

      if (oldIndex === -1 || newIndex === -1) return prev;

      return normalizeOrder(arrayMove(ordered, oldIndex, newIndex));
    });
  }

  function handleToggle(sectionId: string) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, enabled: !section.enabled }
          : section
      )
    );
  }

  function handleFieldChange(
    sectionId: string,
    fieldName: string,
    value: SectionPropValue
  ) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              props: {
                ...section.props,
                [fieldName]: value,
              },
            }
          : section
      )
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch("/api/admin/builder/home", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenantId,
          homeSections: sections,
          footer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo guardar");
      }

      setSections(data.homeSections);
      setFooter(data.footer);
      setMessage("Home y footer guardados correctamente.");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error guardando cambios.";

      setMessage(errorMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">
              Home Builder
            </h1>
            <p className="mt-1 text-gray-500">
              Activá, arrastrá y editá las secciones de la tienda.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-3">
            <AddSectionButton onAdd={handleAddSection} />
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sectionIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {orderedSections.map((section) => (
                    <SectionListItem
                      key={section.id}
                      section={section}
                      isSelected={section.id === selectedId}
                      onSelect={() => setSelectedId(section.id)}
                      onToggle={() => handleToggle(section.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </aside>

          <AiHomeGenerator
            onGenerated={() => {
              window.location.reload();
            }}
          />

          <div className="space-y-6">
            <SectionEditor
              section={selectedSection}
              onChange={handleFieldChange}
            />

            <FooterEditor footer={footer} onChange={setFooter} />

            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-950">
                  Preview en vivo
                </h2>
                <p className="text-sm text-gray-500">
                  Así se verá la home con la configuración actual.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <HomeBuilderRenderer sections={sections} />
                <StorefrontFooter
                  footer={footer}
                  store={store}
                  storeName={storeName}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}