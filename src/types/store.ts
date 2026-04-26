export type TenantConfig = {
  _id?: string;
  slug: string;
  name: string;
  logoText: string;
  whatsapp: string;
  primaryColor: string;
  freeShippingFrom: number;
  social: {
    instagram?: string;
    facebook?: string;
  };
  appearance?: StoreAppearance;
};

export type Category = {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  image?: string;
};

export type CategoryTree = MongoCategory & {
  children: CategoryTree[];
};

export type Product = {
  id?: string;
  _id?: string;
  tenantSlug?: string;
  tenantId?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  brand?: string;
  categorySlug: string;
  images: string[];
  featured?: boolean;
  offer?: boolean;
  active?: boolean;
  stock: number;
  properties: Record<string, string | number | boolean | string[]>;
  createdAt?: string;
  variants?: ProductVariant[];
};

export type ProductVariant = {
  sku: string;
  talle?: string;
  color?: string;
  stock: number;
  price?: number;
  compareAtPrice?: number;
  image?: string;
  active?: boolean;
};

export type MongoProduct = Product & {
  _id: string;
};

export type MongoCategory = Category & {
  _id: string;
};

export type CartItemInput = {
  productId: string;
  variantSku?: string;
  quantity: number;
};

export type AnalyticsEventName =
  | "page_view"
  | "view_product"
  | "add_to_cart"
  | "begin_checkout"
  | "checkout_redirect"
  | "purchase_paid";

export type AnalyticsPayload = {
  tenantSlug: string;
  event: AnalyticsEventName;
  path?: string;
  referrer?: string;
  productId?: string;
  productSlug?: string;
  productTitle?: string;
  orderId?: string;
  publicCode?: string;
  value?: number;
  currency?: string;
  metadata?: Record<string, unknown>;
};

export type OrderItem = {
  productId: string;
  variantSku?: string;
  title: string;
  slug?: string;
  quantity: number;
  unitPrice: number;
  image?: string;
  talle?: string;
  color?: string;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "failed";

export type MongoOrder = {
  _id: string;
  tenantId: string;
  publicCode: string;
  buyer?: CheckoutBuyer;
  items: OrderItem[];
  itemsTotal: number;
  shippingTotal: number;
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  shippingCarrier?: string;
  shippingMethod?: string;
  shippingNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryType = "pickup" | "shipping";

export type ShippingQuote = {
  provider: "local" | "flat" | "correo_argentino" | "andreani";
  service: string;
  price: number;
  eta?: string;
  deliveryType: DeliveryType;
  postalCodeOrigin?: string;
  postalCodeDestination?: string;
};

export type CheckoutShipping = {
  deliveryType: DeliveryType;
  postalCode?: string;
  quote?: ShippingQuote;
};

export type CheckoutBuyer = {
  name: string;
  email: string;
  phone: string;
  dni?: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
};

export type CheckoutBody = {
  items: CartItemInput[];
  buyer: CheckoutBuyer;
  shipping: CheckoutShipping;
};

export type StoreAppearance = {
  logoImage?: string;
  favicon?: string;

  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;

  buttonRadius: "square" | "soft" | "pill";
  fontStyle: "modern" | "elegant" | "classic";
  layoutStyle: "minimal" | "sport" | "premium";

  promoBarEnabled: boolean;
  promoMessages: string[];

  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  heroCtaText?: string;

  bannerTitle?: string;
  bannerSubtitle?: string;
  bannerImage?: string;
};