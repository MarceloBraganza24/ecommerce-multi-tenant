"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  store: string;
  name: string;
  defaultValue?: string;
  label: string;
  multiple?: boolean;
};

export function ImageUploader({
  store,
  name,
  defaultValue = "",
  label,
  multiple = false,
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  const images = value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setLoading(true);

    try {
      const data = new FormData();

      data.set("store", store);
      data.set("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "No se pudo subir imagen");
        return;
      }

      setValue((current) => {
        if (!multiple) return json.url;

        return current ? `${current}\n${json.url}` : json.url;
      });
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input type="hidden" name={name} value={value} />

      {images.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {images.map((image) => (
            <div
              key={image}
              className="relative h-36 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50"
            >
              <Image
                src={image}
                alt={label}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        disabled={loading}
        onChange={handleUpload}
        className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm"
      />

      {value && (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="min-h-24 w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-600"
        />
      )}

      {loading && <p className="text-sm text-gray-500">Subiendo imagen...</p>}
    </div>
  );
}