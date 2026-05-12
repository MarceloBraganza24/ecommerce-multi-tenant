import { HomeSectionType, SectionProps } from "@/types/builder";
import { HeroSection } from "@/components/storefront/sections/HeroSection";
import { ProductGridSection } from "@/components/storefront/sections/ProductGridSection";
import { BannerSection } from "@/components/storefront/sections/BannerSection";
import { FaqSection } from "@/components/storefront/sections/FaqSection";
import { TestimonialsSection } from "@/components/storefront/sections/TestimonialsSection";
import { NewsletterSection } from "@/components/storefront/sections/NewsletterSection";
import { InstagramFeedSection } from "@/components/storefront/sections/InstagramFeedSection";

export const sectionRegistry: Record<
  HomeSectionType,
  React.ComponentType<SectionProps>
> = {
  hero: HeroSection,
  products: ProductGridSection,
  banner: BannerSection,
  faq: FaqSection,
  testimonials: TestimonialsSection,
  newsletter: NewsletterSection,
  instagram: InstagramFeedSection,
};