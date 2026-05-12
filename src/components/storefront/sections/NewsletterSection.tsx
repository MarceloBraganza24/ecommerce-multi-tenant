import { SectionPropValue } from "@/types/builder";

type Props = {
  title?: SectionPropValue;
  subtitle?: SectionPropValue;
  placeholder?: SectionPropValue;
  buttonText?: SectionPropValue;
};

export function NewsletterSection({
  title,
  subtitle,
  placeholder,
  buttonText,
}: Props) {
  const safeTitle =
    typeof title === "string" ? title : "Recibí novedades y promociones";

  const safeSubtitle =
    typeof subtitle === "string"
      ? subtitle
      : "Sumate para enterarte primero de nuevos productos y ofertas.";

  const safePlaceholder =
    typeof placeholder === "string" ? placeholder : "Tu email";

  const safeButtonText =
    typeof buttonText === "string" ? buttonText : "Suscribirme";

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-8">
      <div className="rounded-[2rem] bg-gray-950 px-6 py-12 text-white md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">{safeTitle}</h2>

          <p className="mt-3 text-sm leading-6 text-gray-300">
            {safeSubtitle}
          </p>

          <form className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder={safePlaceholder}
              className="min-h-12 flex-1 rounded-full border border-white/10 bg-white px-5 text-sm text-gray-950 outline-none"
            />

            <button
              type="button"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-950"
            >
              {safeButtonText}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}