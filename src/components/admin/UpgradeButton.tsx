"use client";

export function UpgradeButton() {
  async function handleUpgrade() {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
    });

    const data = await res.json();

    window.location.href = data.url;
  }

  return (
    <button
      onClick={handleUpgrade}
      className="rounded-full bg-purple-600 px-5 py-2 text-white"
    >
      🚀 Pasar a PRO
    </button>
  );
}