import Image from "next/image";
import Link from "next/link";

type Props = {
  title?: string;
  subtitle?: string;
  image?: string;
  ctaText?: string;
  ctaLink?: string;
};

export function HeroSection({
  title = "Tu tienda online",
  subtitle = "Comprá fácil, rápido y seguro.",
  image,
  ctaText = "Comprar ahora",
  ctaLink = "/products",
}: Props) {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Tienda online
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-gray-950 md:text-6xl">
          {title}
        </h1>

        <p className="mt-5 max-w-xl text-lg text-gray-600">{subtitle}</p>

        {ctaText && ctaLink && (
          <Link
            href={ctaLink}
            className="mt-8 inline-flex rounded-full bg-gray-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            {ctaText}
          </Link>
        )}
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-gray-100">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Imagen principal
          </div>
        )}
      </div>
    </section>
  );
}