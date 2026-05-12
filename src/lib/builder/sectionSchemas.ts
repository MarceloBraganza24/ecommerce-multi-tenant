import { HomeSectionType } from "@/types/builder";

export type SectionField = {
  name: string;
  label: string;
  type: SectionFieldType;
  placeholder?: string;
};

export type SectionFieldType =
  | "text"
  | "textarea"
  | "image"
  | "number"
  | "faq-list"
  | "testimonial-list"
  | "instagram-list";

export const sectionSchemas: Record<HomeSectionType, SectionField[]> = {
  testimonials: [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Lo que dicen nuestros clientes",
    },
    {
      name: "subtitle",
      label: "Subtítulo",
      type: "textarea",
      placeholder: "Experiencias reales de personas que ya compraron.",
    },
    {
      name: "items",
      label: "Testimonios",
      type: "testimonial-list",
    },
  ],

  newsletter: [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Recibí novedades y promociones",
    },
    {
      name: "subtitle",
      label: "Subtítulo",
      type: "textarea",
      placeholder: "Enterate primero de nuevos productos y ofertas.",
    },
    {
      name: "placeholder",
      label: "Placeholder email",
      type: "text",
      placeholder: "Tu email",
    },
    {
      name: "buttonText",
      label: "Texto botón",
      type: "text",
      placeholder: "Suscribirme",
    },
  ],

  instagram: [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Seguinos en Instagram",
    },
    {
      name: "subtitle",
      label: "Subtítulo",
      type: "textarea",
      placeholder: "Inspiración, novedades y productos destacados.",
    },
    {
      name: "handle",
      label: "Usuario",
      type: "text",
      placeholder: "@tu_tienda",
    },
    {
      name: "items",
      label: "Posts",
      type: "instagram-list",
    },
  ],
  hero: [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Ej: Organizá tu cocina",
    },
    {
      name: "subtitle",
      label: "Subtítulo",
      type: "textarea",
      placeholder: "Ej: Productos pensados para ordenar tu hogar",
    },
    {
      name: "image",
      label: "Imagen principal",
      type: "image",
      placeholder: "URL de imagen",
    },
    {
      name: "ctaText",
      label: "Texto botón",
      type: "text",
      placeholder: "Comprar ahora",
    },
    {
      name: "ctaLink",
      label: "Link botón",
      type: "text",
      placeholder: "/productos",
    },
  ],

  products: [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Productos destacados",
    },
    {
      name: "subtitle",
      label: "Subtítulo",
      type: "textarea",
      placeholder: "Los productos más elegidos",
    },
    {
      name: "limit",
      label: "Cantidad de productos",
      type: "number",
      placeholder: "8",
    },
  ],

  banner: [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Envíos a todo el país",
    },
    {
      name: "subtitle",
      label: "Subtítulo",
      type: "textarea",
      placeholder: "Comprá seguro desde tu casa",
    },
    {
      name: "ctaText",
      label: "Texto botón",
      type: "text",
      placeholder: "Comprar ahora",
    },
    {
      name: "ctaLink",
      label: "Link botón",
      type: "text",
      placeholder: "/productos",
    },
  ],

  faq: [
    {
      name: "title",
      label: "Título",
      type: "text",
      placeholder: "Preguntas frecuentes",
    },
    {
      name: "items",
      label: "Preguntas",
      type: "faq-list",
    },
  ],
};