"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { HomeSection } from "@/types/builder";

type Props = {
  section: HomeSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
};

export function SectionListItem({
  section,
  isSelected,
  onSelect,
  onToggle,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border p-4 transition ${
        isDragging ? "opacity-50 shadow-lg" : ""
      } ${
        isSelected
          ? "border-gray-950 bg-gray-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab rounded-lg border border-gray-200 px-2 py-1 text-sm text-gray-500 active:cursor-grabbing"
            title="Arrastrar sección"
          >
            ☰
          </button>

          <button type="button" onClick={onSelect} className="text-left">
            <p className="font-semibold text-gray-950">
              {section.type.toUpperCase()}
            </p>
            <p className="text-xs text-gray-500">Orden: {section.order}</p>
          </button>
        </div>

        <button
          type="button"
          onClick={onToggle}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            section.enabled
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {section.enabled ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}