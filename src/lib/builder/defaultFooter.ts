import { BuilderFooter } from "@/types/builder";

export const defaultFooter: BuilderFooter = {
  enabled: true,
  description: "Tienda online con compra segura y atención personalizada.",
  legalText: "Todos los derechos reservados.",
  links: [
    {
      label: "Productos",
      href: "/productos",
    },
    {
      label: "Contacto",
      href: "/contacto",
    },
  ],
};