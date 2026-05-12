export type HomeSectionType =
  | "hero"
  | "products"
  | "banner"
  | "faq"
  | "testimonials"
  | "newsletter"
  | "instagram";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FooterLink = {
  label: string;
  href: string;
};

export type TestimonialItem = {
  name: string;
  text: string;
  detail: string;
};

export type InstagramItem = {
  image: string;
  caption: string;
};

export type SectionPropValue =
  | string
  | number
  | boolean
  | null
  | FaqItem[]
  | FooterLink[]
  | TestimonialItem[]
  | InstagramItem[];

export type SectionProps = Record<string, SectionPropValue>;

export type BuilderFooter = {
  enabled: boolean;
  description: string;
  legalText: string;
  links: FooterLink[];
};

export type HomeSection = {
  id: string;
  type: HomeSectionType;
  enabled: boolean;
  order: number;
  props: SectionProps;
};

export type StoreBuilder = {
  homeSections: HomeSection[];
  footer?: BuilderFooter;
};