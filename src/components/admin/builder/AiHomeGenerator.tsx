"use client";

import { useState } from "react";

type Props = {
  onGenerated: () => void;
};

export function AiHomeGenerator({ onGenerated }: Props) {
  const [prompt, setPrompt] = useState(
    "Creame una tienda de ropa deportiva para mujeres, moderna, confiable y enfocada en ventas"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/ai/generate-home", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo generar la home");
      }

      onGenerated();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error generando home";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-purple-200 bg-purple-50 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-purple-950">
          🤖 Generar home con IA
        </h2>

        <p className="mt-1 text-sm text-purple-700">
          Describí la tienda y la IA va a crear secciones, textos, FAQ,
          testimonios y footer.
        </p>
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-purple-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-700"
      />

      {error && (
        <p className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Generando..." : "Generar home"}
      </button>
    </div>
  );
}