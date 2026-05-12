import Link from "next/link";

type Props = {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
};

export function BannerSection({
  title = "Promo especial",
  subtitle = "Aprovechá beneficios exclusivos por tiempo limitado.",
  ctaText = "Comprar ahora",
  ctaLink = "/products",
}: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="rounded-3xl bg-gray-950 px-6 py-10 text-white md:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="mt-2 max-w-2xl text-gray-300">{subtitle}</p>
          </div>

          {ctaText && ctaLink && (
            <Link
              href={ctaLink}
              className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-950 transition hover:bg-gray-100"
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}