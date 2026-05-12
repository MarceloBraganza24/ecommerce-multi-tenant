"use client";

import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";

type Step = 1 | 2 | 3 | 4;
type TemplateId = "minimal" | "premium" | "ecommerce";

type CreateStoreForm = {
  name: string;
  slug: string;
  templateId: TemplateId;
  useAi: boolean;
  aiPrompt: string;
  email: string;
  password: string;
};

const templates: {
  id: TemplateId;
  name: string;
  description: string;
  badge: string;
}[] = [
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple, limpio y elegante.",
    badge: "Ideal para empezar",
  },
  {
    id: "premium",
    name: "Premium",
    description: "Más visual, sofisticado y de marca.",
    badge: "Marca cuidada",
  },
  {
    id: "ecommerce",
    name: "Ecommerce fuerte",
    description: "Promos, confianza y foco en vender.",
    badge: "Más vendedor",
  },
];

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function CreateStorePage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateStoreForm>({
    name: "",
    slug: "",
    templateId: "minimal",
    useAi: false,
    aiPrompt: "",
    email: "",
    password: "",
  });

  const progress = useMemo(() => {
    if (step === 4) return 100;
    return Math.round((step / 3) * 100);
  }, [step]);

  function updateField<K extends keyof CreateStoreForm>(
    key: K,
    value: CreateStoreForm[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleNameChange(value: string) {
    setForm((prev) => ({
      ...prev,
      name: value,
      slug: generateSlug(value),
    }));
  }

  function canGoNext() {
    if (step === 1) return form.name.length >= 3 && form.slug.length >= 3;

    if (step === 2) {
      if (form.useAi) return form.aiPrompt.trim().length >= 10;
      return Boolean(form.templateId);
    }

    if (step === 3) return form.email.length > 5 && form.password.length >= 8;

    return false;
  }

  async function handleCreateStore() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/tenants/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo crear la tienda");
      }

      const loginResult = await signIn("credentials", {
        store: form.slug,
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (loginResult?.error) {
        throw new Error("La tienda se creó, pero no se pudo iniciar sesión automáticamente.");
      }

      setStep(4);

      setTimeout(() => {
        window.location.href = data.adminUrl;
      }, 1400);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error creando tienda";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="onboardingPage">
      <div className="onboardingShell">
        <section className="onboardingAside">
          <p className="onboardingAsideBadge">Crear tienda online</p>

          <h1 className="onboardingAsideTitle">
            Tu tienda lista en pocos minutos.
          </h1>

          <p className="onboardingAsideText">
            Elegí un diseño, cargá tus datos y entrá directo al panel para
            empezar a vender.
          </p>

          <div className="onboardingChecklist">
            {[
              "Home Builder editable",
              "Checkout y pedidos",
              "Templates visuales",
              "Admin propio por tienda",
            ].map((item) => (
              <div key={item} className="onboardingCheckItem">
                <span className="onboardingCheckIcon">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="onboardingCard">
          <div className="onboardingTop">
            <div>
              <p className="onboardingStepLabel">
                Paso {step === 4 ? 3 : step} de 3
              </p>

              <h2 className="onboardingTitle">
                {step === 1 && "Nombre y URL"}
                {step === 2 && "Diseño o IA"}
                {step === 3 && "Creá tu acceso"}
                {step === 4 && "Tu tienda está lista"}
              </h2>
            </div>

            <span className="onboardingPercent">{progress}%</span>
          </div>

          <div className="progressTrack">
            <div
              className="progressFill"
              style={{ width: `${progress}%` }}
            />
          </div>

          {error && <div className="saasError">{error}</div>}

          <div className="stepContent">
            {step === 1 && (
              <div className="stepFade space-y-5">
                <div>
                  <label className="saasLabel">Nombre de tu tienda</label>

                  <input
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Urban Style"
                    className="saasInput"
                  />
                </div>

                <div>
                  <label className="saasLabel">URL de tu tienda</label>

                  <input
                    value={form.slug}
                    onChange={(e) =>
                      updateField("slug", generateSlug(e.target.value))
                    }
                    placeholder="urban-style"
                    className="saasInput"
                  />
                </div>

                {form.slug && (
                  <div className="saasCard p-4 text-sm text-gray-600">
                    Tu tienda quedará en:
                    <p className="mt-1 font-semibold text-gray-950">
                      /{form.slug}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="stepFade space-y-5">
                <div className="aiBox">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-950">
                        🤖 Crear home con IA
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-gray-500">
                        Describí tu negocio y generamos automáticamente textos,
                        secciones, FAQ y estructura de la home.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => updateField("useAi", !form.useAi)}
                      className={`aiToggle ${
                        form.useAi ? "aiToggleActive" : ""
                      }`}
                    >
                      {form.useAi ? "IA activada" : "Activar IA"}
                    </button>
                  </div>

                  {form.useAi && (
                    <div className="mt-4">
                      <label className="saasLabel">
                        ¿Qué tipo de tienda querés crear?
                      </label>

                      <textarea
                        value={form.aiPrompt}
                        onChange={(e) =>
                          updateField("aiPrompt", e.target.value)
                        }
                        rows={4}
                        placeholder="Ej: vendo ropa deportiva para mujeres, con estilo moderno, cómoda y enfocada en entrenamiento y uso diario"
                        className="saasTextarea"
                      />

                      <p className="saasHelp">
                        Mínimo 10 caracteres. Cuanto más detalle pongas, mejor
                        queda la tienda.
                      </p>
                    </div>
                  )}
                </div>

                {!form.useAi && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-950">
                        Elegí un diseño inicial
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Después podés editar todo desde el Home Builder.
                      </p>
                    </div>

                    {templates.map((template) => {
                      const selected = form.templateId === template.id;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() =>
                            updateField("templateId", template.id)
                          }
                          className={`templateCard ${
                            selected ? "templateCardSelected" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-lg font-bold text-gray-950">
                                {template.name}
                              </p>
                              <p className="mt-1 text-sm text-gray-500">
                                {template.description}
                              </p>
                            </div>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                selected
                                  ? "bg-gray-950 text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {template.badge}
                            </span>
                          </div>

                          <div className="templatePreview">
                            <span />
                            <span />
                            <span />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="stepFade space-y-5">
                <div>
                  <label className="saasLabel">
                    Email para ingresar al admin
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="admin@tutienda.com"
                    className="saasInput"
                  />
                </div>

                <div>
                  <label className="saasLabel">Contraseña</label>

                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="saasInput"
                  />

                  <p className="saasHelp">
                    Esta contraseña te servirá para entrar luego al panel de
                    administración.
                  </p>
                </div>

                <div className="saasCard p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-950">
                    Resumen antes de crear:
                  </p>

                  <div className="mt-3 space-y-1">
                    <p>
                      Tienda: <strong>{form.name || "Sin nombre"}</strong>
                    </p>

                    <p>
                      URL: <strong>/{form.slug || "sin-url"}</strong>
                    </p>

                    <p>
                      Diseño:{" "}
                      <strong>
                        {form.useAi ? "Generado con IA" : form.templateId}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="successState stepFade">
                <div>
                  <div className="successIcon">🎉</div>

                  <h3 className="text-2xl font-bold text-gray-950">
                    Tu tienda está lista
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-gray-500">
                    Estamos entrando al panel para que puedas personalizarla y
                    cargar tus productos.
                  </p>
                </div>
              </div>
            )}
          </div>

          {step !== 4 && (
            <div className="onboardingActions">
              <button
                type="button"
                onClick={() =>
                  setStep((prev) => (prev > 1 ? ((prev - 1) as Step) : prev))
                }
                disabled={step === 1 || loading}
                className="saasButton saasButtonSecondary"
              >
                Volver
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev + 1) as Step)}
                  disabled={!canGoNext() || loading}
                  className="saasButton"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateStore}
                  disabled={!canGoNext() || loading}
                  className="saasButton"
                >
                  {loading ? "Creando..." : "Crear tienda"}
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}