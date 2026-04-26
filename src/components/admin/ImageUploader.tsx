"use client";

import { useState } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  label: string;
  multiple?: boolean;
};

export function ImageUploader({ name, defaultValue = "", label }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const data = new FormData();
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
        return current ? `${current}\n${json.url}` : json.url;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <label>
      {label}
      <input type="file" accept="image/*" onChange={handleUpload} />
      <textarea name={name} value={value} onChange={(e) => setValue(e.target.value)} />
      {loading && <small>Subiendo imagen...</small>}
    </label>
  );
}