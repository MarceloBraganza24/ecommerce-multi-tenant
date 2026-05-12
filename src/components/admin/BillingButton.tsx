"use client";

export function BillingButton() {
  async function handleOpenPortal() {
    const res = await fetch("/api/stripe/portal", {
      method: "POST",
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("No se pudo abrir el portal");
    }
  }

  return (
    <button
      onClick={handleOpenPortal}
      className="rounded-full bg-gray-900 px-5 py-2 text-white"
    >
      ⚙️ Gestionar suscripción
    </button>
  );
}