"use client";

import { UpgradeButton } from "./UpgradeButton";

type Props = {
  current: number;
  limit: number;
  plan: "free" | "pro";
};

export function PlanUsageBar({ current, limit, plan }: Props) {
  if (plan === "pro") return null;

  const percentage = Math.min((current / limit) * 100, 100);
  const remaining = Math.max(limit - current, 0);

  const barColor =
    percentage < 70
      ? "bg-green-500"
      : percentage < 100
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="mb-6 rounded-3xl border border-gray-200 bg-white p-5">
      {/* TEXTO */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-700">
          📦 {current} / {limit} productos
        </p>

        {remaining > 0 ? (
          <span className="text-gray-500">
            Te faltan {remaining}
          </span>
        ) : (
          <span className="text-red-600 font-semibold">
            Límite alcanzado
          </span>
        )}
      </div>

      {/* BARRA */}
      <div className="mt-3 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {remaining === 0
            ? "🚧 Necesitás PRO para seguir creando productos"
            : "Pasate a PRO para productos ilimitados"}
        </p>

        <UpgradeButton />
      </div>
    </div>
  );
}