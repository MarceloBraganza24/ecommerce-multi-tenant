"use client";

import { useState } from "react";

type DnsInstruction = {
  type: string;
  name: string;
  value: string;
  description?: string;
};

type Props = {
  store: string;
  initialDomain?: string;
  initialVerified?: boolean;
  initialDns?: DnsInstruction | null;
};

export function CustomDomainCard({
  store,
  initialDomain = "",
  initialVerified = false,
  initialDns = null,
}: Props) {
  const [domain, setDomain] = useState(initialDomain);
  const [savedDomain, setSavedDomain] = useState(initialDomain);
  const [verified, setVerified] = useState(initialVerified);
  const [dns, setDns] = useState<DnsInstruction | null>(initialDns);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function connectDomain() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store,
          domain,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo conectar el dominio");
      }

      setSavedDomain(data.domain);
      setDomain(data.domain);
      setVerified(data.verified);
      setDns(data.dns);
      setMessage(
        data.verified
          ? "Dominio conectado y verificado."
          : "Dominio agregado. Configurá el DNS y luego verificá."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Error conectando dominio"
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyDomain() {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch("/api/admin/domain", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          store,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo verificar el dominio");
      }

      setVerified(data.verified);
      setMessage(
        data.verified
          ? "Dominio verificado. Ya podés usarlo."
          : "Todavía no está verificado. Revisá los DNS."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Error verificando dominio"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.2em] text-violet-600">
            Dominio personalizado
          </span>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">
            Conectá tu propio dominio
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-gray-500">
            Permití que tus clientes entren a tu tienda desde un dominio propio,
            por ejemplo: tienda.com o shop.tienda.com.
          </p>
        </div>

        {savedDomain && (
          <span
            className={`rounded-full px-4 py-2 text-xs font-black ${
              verified
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {verified ? "Verificado" : "Pendiente"}
          </span>
        )}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto]">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="midominio.com"
          className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-gray-950"
        />

        <button
          type="button"
          onClick={connectDomain}
          disabled={loading || !domain}
          className="rounded-2xl bg-gray-950 px-6 py-3 text-sm font-black text-white disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Conectar dominio"}
        </button>
      </div>

      {dns && (
        <div className="mt-8 rounded-3xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-lg font-black text-gray-950">
            Configuración DNS requerida
          </h2>

          <p className="mt-1 text-sm text-gray-500">{dns.description}</p>

          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Valor</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-3 font-bold">{dns.type}</td>
                  <td className="px-4 py-3">{dns.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{dns.value}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            type="button"
            onClick={verifyDomain}
            disabled={loading || !savedDomain}
            className="mt-5 rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-black text-gray-950 disabled:opacity-50"
          >
            Verificar dominio
          </button>
        </div>
      )}

      {message && (
        <p className="mt-5 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {message}
        </p>
      )}
    </section>
  );
}