"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FilterGroup } from "@/lib/filter-products";

type Props = {
  groups: FilterGroup[];
  totalResults: number;
};

const SORT_OPTIONS = [
  { label: "Precio (bajo/alto)", value: "precio-menor" },
  { label: "Las novedades primero", value: "novedades" },
  { label: "Lo más vendido", value: "mas-vendido" },
  { label: "Precio (alto/bajo)", value: "precio-mayor" },
  { label: "Destacados", value: "destacados" },
];

export function ProductFiltersDrawer({ groups, totalResults }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [draftParams, setDraftParams] = useState(() => {
    return new URLSearchParams(searchParams.toString());
  });

  const activeCount = useMemo(() => {
    let count = 0;

    draftParams.forEach((value, key) => {
      if (value && key !== "ordenar") count += 1;
    });

    return count;
  }, [draftParams]);

  function refreshDraft() {
    setDraftParams(new URLSearchParams(searchParams.toString()));
  }

  function openDrawer() {
    refreshDraft();
    setOpen(true);
  }

  function closeDrawer() {
    setOpen(false);
  }

  function isSelected(key: string, value: string) {
    const current = draftParams.get(key);
    if (!current) return false;

    return current.split(",").includes(value);
  }

  function toggleMultiValue(key: string, value: string) {
    const next = new URLSearchParams(draftParams.toString());
    const current = next.get(key);
    const values = current ? current.split(",") : [];

    const exists = values.includes(value);
    const updated = exists
      ? values.filter((item) => item !== value)
      : [...values, value];

    if (updated.length) {
      next.set(key, updated.join(","));
    } else {
      next.delete(key);
    }

    setDraftParams(next);
  }

  function setSingleValue(key: string, value: string) {
    const next = new URLSearchParams(draftParams.toString());

    if (next.get(key) === value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }

    setDraftParams(next);
  }

  function setTextValue(key: string, value: string) {
    const next = new URLSearchParams(draftParams.toString());

    if (value.trim()) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setDraftParams(next);
  }

  function clearAll() {
    setDraftParams(new URLSearchParams());
  }

  function applyFilters() {
    const query = draftParams.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  }

  function removeFilter(key: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete(key);

    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const currentAppliedParams = Array.from(searchParams.entries()).filter(
    ([key, value]) => value && key !== "ordenar"
  );

  return (
    <>
      <div className="productsToolbar">
        <button className="filterOpenButton" onClick={openDrawer}>
          Filtrar y ordenar
          {activeCount > 0 && <span>{activeCount}</span>}
        </button>

        <p>{totalResults} resultados</p>
      </div>

      {currentAppliedParams.length > 0 && (
        <div className="activeFilters">
          {currentAppliedParams.map(([key, value]) => (
            <button key={key} onClick={() => removeFilter(key)}>
              {key}: {value} ×
            </button>
          ))}

          <button className="clearFiltersChip" onClick={() => router.push(pathname)}>
            Borrar todo
          </button>
        </div>
      )}

      <aside className={`filtersOverlay ${open ? "open" : ""}`}>
        <div className="filtersDrawer">
          <header className="filtersHeader">
            <button onClick={clearAll}>Borrar todo</button>

            <strong>
              Filtrar
              <br />
              resultados
            </strong>

            <button onClick={closeDrawer} aria-label="Cerrar filtros">
              ×
            </button>
          </header>

          <div className="filtersBody">
            <section className="filterSection">
              <h3>Buscar</h3>

              <input
                className="filterSearchInput"
                placeholder="Buscar producto..."
                value={draftParams.get("q") || ""}
                onChange={(event) => setTextValue("q", event.target.value)}
              />
            </section>

            <section className="filterSection">
              <h3>Ordenar por</h3>

              <div className="sortList">
                {SORT_OPTIONS.map((option) => {
                  const selected = draftParams.get("ordenar") === option.value;

                  return (
                    <button
                      key={option.value}
                      className={`sortOption ${selected ? "selected" : ""}`}
                      onClick={() => setSingleValue("ordenar", option.value)}
                    >
                      <span />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="filterSection">
              <h3>Precio</h3>

              <div className="priceFilterGrid">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={draftParams.get("min") || ""}
                  onChange={(event) => setTextValue("min", event.target.value)}
                />

                <input
                  type="number"
                  placeholder="Máximo"
                  value={draftParams.get("max") || ""}
                  onChange={(event) => setTextValue("max", event.target.value)}
                />
              </div>
            </section>

            {groups.map((group) => (
              <section key={group.key} className="filterSection">
                <h3>{group.label}</h3>

                <div className="filterPills">
                  {group.options.map((option) => {
                    const selected = isSelected(group.key, option.value);

                    return (
                      <button
                        key={`${group.key}-${option.value}`}
                        className={`filterPill ${selected ? "selected" : ""}`}
                        onClick={() => toggleMultiValue(group.key, option.value)}
                      >
                        {option.colorHex && (
                          <span
                            className="colorSwatch"
                            style={{ backgroundColor: option.colorHex }}
                          />
                        )}

                        {option.label}

                        <small>{option.count}</small>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <footer className="filtersFooter">
            <button onClick={applyFilters}>
              {totalResults} resultados <span>→</span>
            </button>
          </footer>
        </div>
      </aside>
    </>
  );
}