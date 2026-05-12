import { HomeSection, HomeSectionType } from "@/types/builder";

export function createDefaultSection(
  type: HomeSectionType,
  order: number
): HomeSection {
  const id = `${type}-${crypto.randomUUID()}`;

  switch (type) {
    case "hero":
      return {
        id,
        type,
        enabled: true,
        order,
        props: {
          title: "Nueva sección principal",
          subtitle: "Editá este texto desde el builder.",
          image: "",
          ctaText: "Ver productos",
          ctaLink: "/productos",
        },
      };

    case "products":
      return {
        id,
        type,
        enabled: true,
        order,
        props: {
          title: "Productos destacados",
          subtitle: "Mostrá los productos más importantes.",
          limit: 8,
        },
      };

    case "banner":
      return {
        id,
        type,
        enabled: true,
        order,
        props: {
          title: "Nuevo banner",
          subtitle: "Usá este espacio para destacar una promo.",
          ctaText: "Comprar ahora",
          ctaLink: "/productos",
        },
      };

    case "faq":
      return {
        id,
        type,
        enabled: true,
        order,
        props: {
          title: "Preguntas frecuentes",
          items: [
            {
              question: "¿Hacen envíos?",
              answer: "Sí, hacemos envíos según la configuración de la tienda.",
            },
          ],
        },
      };

    case "testimonials":
      return {
        id,
        type,
        enabled: true,
        order,
        props: {
          title: "Lo que dicen nuestros clientes",
          subtitle: "Experiencias reales que generan confianza.",
          items: [
            {
              name: "Cliente feliz",
              text: "Muy buena experiencia de compra.",
              detail: "Compra verificada",
            },
          ],
        },
      };

    case "newsletter":
      return {
        id,
        type,
        enabled: true,
        order,
        props: {
          title: "Recibí novedades y promociones",
          subtitle: "Enterate primero de lanzamientos y beneficios.",
          placeholder: "Tu email",
          buttonText: "Suscribirme",
        },
      };

    case "instagram":
      return {
        id,
        type,
        enabled: true,
        order,
        props: {
          title: "Seguinos en Instagram",
          subtitle: "Inspiración, novedades y productos destacados.",
          handle: "@tu_tienda",
          items: [
            { image: "", caption: "Producto destacado" },
            { image: "", caption: "Nuevo ingreso" },
            { image: "", caption: "Promo especial" },
            { image: "", caption: "Cliente feliz" },
          ],
        },
      };
  }
}