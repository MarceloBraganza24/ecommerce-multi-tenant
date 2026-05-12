import { BuilderFooter, HomeSection } from "@/types/builder";

export type TemplateId = "minimal" | "premium" | "ecommerce";

export type StoreTemplate = {
  id: TemplateId;
  name: string;
  description: string;
  homeSections: HomeSection[];
  footer: BuilderFooter;
};

export const templates: Record<TemplateId, StoreTemplate> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Diseño simple, limpio y elegante.",
    homeSections: [
      {
        id: "hero-minimal",
        type: "hero",
        enabled: true,
        order: 1,
        props: {
          title: "Una tienda simple y elegante",
          subtitle: "Productos seleccionados para comprar fácil y seguro.",
          image: "",
          ctaText: "Ver productos",
          ctaLink: "/productos",
        },
      },
      {
        id: "products-minimal",
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
        id: "faq-minimal",
        type: "faq",
        enabled: true,
        order: 3,
        props: {
          title: "Preguntas frecuentes",
          items: [
            {
              question: "¿Cómo compro?",
              answer: "Elegís tus productos, completás tus datos y pagás seguro.",
            },
            {
              question: "¿Hacen envíos?",
              answer: "Sí, hacemos envíos según la configuración de la tienda.",
            },
          ],
        },
      },
    ],
    footer: {
      enabled: true,
      description: "Tienda online con compra segura.",
      legalText: "Todos los derechos reservados.",
      links: [
        { label: "Productos", href: "/productos" },
        { label: "Contacto", href: "/contacto" },
      ],
    },
  },

  premium: {
    id: "premium",
    name: "Premium",
    description: "Ideal para marcas cuidadas, lifestyle o decoración.",
    homeSections: [
      {
        id: "hero-premium",
        type: "hero",
        enabled: true,
        order: 1,
        props: {
          title: "Diseño, calidad y experiencia premium",
          subtitle:
            "Una selección pensada para quienes valoran los detalles.",
          image: "",
          ctaText: "Descubrir colección",
          ctaLink: "/productos",
        },
      },
      {
        id: "testimonials-premium",
        type: "testimonials",
        enabled: true,
        order: 2,
        props: {
          title: "Clientes que vuelven",
          subtitle: "Experiencias reales que construyen confianza.",
          items: [
            {
              name: "Sofía",
              text: "Excelente atención y productos hermosos.",
              detail: "Compra verificada",
            },
            {
              name: "Camila",
              text: "Llegó rápido y la presentación fue impecable.",
              detail: "Cliente frecuente",
            },
            {
              name: "Lucía",
              text: "Se nota el cuidado en cada detalle.",
              detail: "Compra verificada",
            },
          ],
        },
      },
      {
        id: "newsletter-premium",
        type: "newsletter",
        enabled: true,
        order: 3,
        props: {
          title: "Sumate a la comunidad",
          subtitle: "Recibí lanzamientos, novedades y beneficios exclusivos.",
          placeholder: "Tu email",
          buttonText: "Quiero sumarme",
        },
      },
      {
        id: "faq-premium",
        type: "faq",
        enabled: true,
        order: 4,
        props: {
          title: "Preguntas frecuentes",
          items: [
            {
              question: "¿Los productos tienen garantía?",
              answer: "Cada tienda puede informar sus condiciones de garantía.",
            },
            {
              question: "¿Puedo consultar antes de comprar?",
              answer: "Sí, podés contactar por WhatsApp desde la tienda.",
            },
          ],
        },
      },
    ],
    footer: {
      enabled: true,
      description: "Una experiencia de compra cuidada de principio a fin.",
      legalText: "Todos los derechos reservados.",
      links: [
        { label: "Colección", href: "/productos" },
        { label: "Contacto", href: "/contacto" },
      ],
    },
  },

  ecommerce: {
    id: "ecommerce",
    name: "Ecommerce fuerte",
    description: "Pensado para vender más con promociones, prueba social y CTA.",
    homeSections: [
      {
        id: "hero-ecommerce",
        type: "hero",
        enabled: true,
        order: 1,
        props: {
          title: "Comprá online fácil, rápido y seguro",
          subtitle:
            "Promociones, envíos y atención personalizada para comprar sin vueltas.",
          image: "",
          ctaText: "Comprar ahora",
          ctaLink: "/productos",
        },
      },
      {
        id: "banner-ecommerce",
        type: "banner",
        enabled: true,
        order: 2,
        props: {
          title: "Promos por tiempo limitado",
          subtitle: "Aprovechá beneficios exclusivos antes de que terminen.",
          ctaText: "Ver ofertas",
          ctaLink: "/productos",
        },
      },
      {
        id: "products-ecommerce",
        type: "products",
        enabled: true,
        order: 3,
        props: {
          title: "Más elegidos",
          subtitle: "Productos destacados para comprar hoy.",
          limit: 8,
        },
      },
      {
        id: "testimonials-ecommerce",
        type: "testimonials",
        enabled: true,
        order: 4,
        props: {
          title: "Compras reales, clientes felices",
          subtitle: "Confianza para decidir mejor.",
          items: [
            {
              name: "Mariana",
              text: "Compré rápido y me atendieron excelente.",
              detail: "Compra verificada",
            },
            {
              name: "Florencia",
              text: "Muy buena experiencia de principio a fin.",
              detail: "Cliente verificada",
            },
            {
              name: "Rocío",
              text: "Volvería a comprar sin dudarlo.",
              detail: "Compra verificada",
            },
          ],
        },
      },
      {
        id: "instagram-ecommerce",
        type: "instagram",
        enabled: true,
        order: 5,
        props: {
          title: "Inspiración para comprar",
          subtitle: "Mirá novedades, usos y destacados.",
          handle: "@tu_tienda",
          items: [
            { image: "", caption: "Producto destacado" },
            { image: "", caption: "Promo especial" },
            { image: "", caption: "Nuevo ingreso" },
            { image: "", caption: "Cliente feliz" },
          ],
        },
      },
      {
        id: "faq-ecommerce",
        type: "faq",
        enabled: true,
        order: 6,
        props: {
          title: "Dudas antes de comprar",
          items: [
            {
              question: "¿Es segura la compra?",
              answer: "Sí, la tienda cuenta con checkout y datos protegidos.",
            },
            {
              question: "¿Cómo coordino el envío?",
              answer: "Luego de comprar, la tienda informa los pasos de entrega.",
            },
          ],
        },
      },
    ],
    footer: {
      enabled: true,
      description: "Comprá fácil, rápido y seguro.",
      legalText: "Todos los derechos reservados.",
      links: [
        { label: "Comprar", href: "/productos" },
        { label: "Contacto", href: "/contacto" },
      ],
    },
  },
};