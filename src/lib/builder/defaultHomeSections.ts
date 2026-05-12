import { HomeSection } from "@/types/builder";

export const defaultHomeSections: HomeSection[] = [
  {
    id: "hero-main",
    type: "hero",
    enabled: true,
    order: 1,
    props: {
      title: "Creá tu tienda online en minutos",
      subtitle: "Vendé tus productos con checkout, envíos y diseño profesional.",
      image: "",
      ctaText: "Ver productos",
      ctaLink: "/productos",
    },
  },
  {
    id: "products-featured",
    type: "products",
    enabled: true,
    order: 2,
    props: {
      title: "Productos destacados",
      subtitle: "Los favoritos de nuestra tienda.",
      limit: 8,
    },
  },
  {
    id: "faq-main",
    type: "faq",
    enabled: true,
    order: 3,
    props: {
      title: "Preguntas frecuentes",
      items: [
        {
          question: "¿Hacen envíos?",
          answer: "Sí, hacemos envíos a todo el país.",
        },
        {
          question: "¿Puedo pagar con Mercado Pago?",
          answer: "Sí, podés pagar de forma segura con Mercado Pago.",
        },
      ],
    },
  },
  {
    id: "promo-banner",
    type: "banner",
    enabled: true,
    order: 4,
    props: {
      title: "Envíos a todo el país",
      subtitle: "Comprá seguro y recibí en tu casa.",
      ctaText: "Comprar ahora",
      ctaLink: "/productos",
    },
  },
];