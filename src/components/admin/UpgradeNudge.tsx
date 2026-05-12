"use client";

import { UpgradeButton } from "./UpgradeButton";

type Props = {
  show: boolean;
};

export function UpgradeNudge({ show }: Props) {
  if (!show) return null;

  return (
    <div className="mt-6 rounded-3xl border border-purple-200 bg-purple-50 p-6 text-center">
      <h3 className="text-lg font-semibold text-purple-800">
        🚀 Desbloqueá todo el potencial
      </h3>

      <p className="mt-2 text-sm text-purple-700">
        Pasate a PRO para productos ilimitados y funciones avanzadas.
      </p>

      <div className="mt-4">
        <UpgradeButton />
      </div>
    </div>
  );
}