"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

type Props = {
  store: string;
};

export function AdminLoginForm({ store }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const result = await signIn("credentials", {
        store,
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Email o contraseña incorrectos");
      }

      window.location.href = `/${store}/admin`;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error iniciando sesión";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Email
        </label>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@tienda.com"
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Contraseña
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresá tu contraseña"
          className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-gray-950"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}