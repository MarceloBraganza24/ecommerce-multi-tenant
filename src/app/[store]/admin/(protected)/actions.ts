"use server";

import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { requireTenantAdmin } from "@/lib/adminAuth";
import { Product } from "@/models/Product";
import { Category } from "@/models/Category";
import { Tenant } from "@/models/Tenant";
import { Order } from "@/models/Order";
import { sendOrderStatusWhatsApp } from "@/lib/order-whatsapp";
import type { MongoOrder, OrderStatus } from "@/types/store";
import { parsePromoMessages } from "@/lib/appearance";

function parseVariants(value: string) {
  if (!value.trim()) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed.map((variant) => ({
      sku: String(variant.sku || "").trim(),
      talle: variant.talle ? String(variant.talle) : undefined,
      color: variant.color ? String(variant.color) : undefined,
      stock: Number(variant.stock || 0),
      price: variant.price ? Number(variant.price) : undefined,
      compareAtPrice: variant.compareAtPrice
        ? Number(variant.compareAtPrice)
        : undefined,
      image: variant.image ? String(variant.image) : undefined,
      active: variant.active !== false,
    }));
  } catch {
    return [];
  }
}

function getTotalVariantStock(variants: ReturnType<typeof parseVariants>) {
  return variants.reduce(
    (acc, variant) => acc + Number(variant.stock || 0),
    0
  );
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getNumber(formData: FormData, key: string) {
  return Number(formData.get(key) || 0);
}

function parseImages(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseProperties(
  value: string
): Record<string, string | number | boolean> {
  if (!value.trim()) return {};

  try {
    return JSON.parse(value) as Record<
      string,
      string | number | boolean
    >;
  } catch {
    return {};
  }
}

async function getSafeTenant(store: string) {
  await requireTenantAdmin(store);

  const tenant = await Tenant.findOne({ slug: store }).lean();

  if (!tenant) {
    notFound();
  }

  return JSON.parse(JSON.stringify(tenant));
}

export async function createProductAction(
  store: string,
  formData: FormData
) {
  await connectDB();

  const tenant = await getSafeTenant(store);

  const variants = parseVariants(getString(formData, "variants"));

  await Product.create({
    tenantId: tenant._id,
    title: getString(formData, "title"),
    slug: getString(formData, "slug"),
    description: getString(formData, "description"),
    price: getNumber(formData, "price"),
    compareAtPrice:
      getNumber(formData, "compareAtPrice") || undefined,
    brand: getString(formData, "brand"),
    categorySlug: getString(formData, "categorySlug"),
    images: parseImages(getString(formData, "images")),
    variants,
    stock: variants.length
      ? getTotalVariantStock(variants)
      : getNumber(formData, "stock"),
    featured: formData.get("featured") === "on",
    offer: formData.get("offer") === "on",
    properties: parseProperties(
      getString(formData, "properties")
    ),
    active: true,
  });

  revalidatePath(`/${store}`);
  revalidatePath(`/${store}/productos`);

  redirect(`/${store}/admin/productos`);
}

export async function updateProductAction(
  store: string,
  productId: string,
  formData: FormData
) {
  await connectDB();

  const tenant = await getSafeTenant(store);

  const variants = parseVariants(getString(formData, "variants"));

  await Product.updateOne(
    {
      _id: productId,
      tenantId: tenant._id,
    },
    {
      $set: {
        title: getString(formData, "title"),
        slug: getString(formData, "slug"),
        description: getString(formData, "description"),
        price: getNumber(formData, "price"),
        compareAtPrice:
          getNumber(formData, "compareAtPrice") || undefined,
        brand: getString(formData, "brand"),
        categorySlug: getString(formData, "categorySlug"),
        images: parseImages(getString(formData, "images")),
        variants,
        stock: variants.length
          ? getTotalVariantStock(variants)
          : getNumber(formData, "stock"),
        featured: formData.get("featured") === "on",
        offer: formData.get("offer") === "on",
        active: formData.get("active") === "on",
        properties: parseProperties(
          getString(formData, "properties")
        ),
      },
    }
  );

  revalidatePath(`/${store}`);
  revalidatePath(`/${store}/productos`);

  redirect(`/${store}/admin/productos`);
}

export async function deleteProductAction(
  store: string,
  productId: string
) {
  await connectDB();

  const tenant = await getSafeTenant(store);

  await Product.updateOne(
    {
      _id: productId,
      tenantId: tenant._id,
    },
    {
      $set: { active: false },
    }
  );

  revalidatePath(`/${store}`);
  revalidatePath(`/${store}/productos`);

  redirect(`/${store}/admin/productos`);
}

export async function createCategoryAction(
  store: string,
  formData: FormData
) {
  await connectDB();

  const tenant = await getSafeTenant(store);

  const parentId = getString(formData, "parentId");

  await Category.create({
    tenantId: tenant._id,
    name: getString(formData, "name"),
    slug: getString(formData, "slug"),
    parentId: parentId || null,
    image: getString(formData, "image"),
    active: true,
  });

  revalidatePath(`/${store}`);
  revalidatePath(`/${store}/productos`);

  redirect(`/${store}/admin/categorias`);
}

export async function updateTenantSettingsAction(
  store: string,
  formData: FormData
) {
  await connectDB();

  const tenant = await getSafeTenant(store);

  await Tenant.updateOne(
    { _id: tenant._id },
    {
      $set: {
        name: getString(formData, "name"),
        logoText: getString(formData, "logoText"),
        whatsapp: getString(formData, "whatsapp"),
        primaryColor: getString(formData, "primaryColor"),
        freeShippingFrom: getNumber(
          formData,
          "freeShippingFrom"
        ),
        heroTitle: getString(formData, "heroTitle"),
        heroSubtitle: getString(formData, "heroSubtitle"),
        heroImage: getString(formData, "heroImage"),
        bannerText: getString(formData, "bannerText"),
        mpAccessToken: getString(formData, "mpAccessToken"),
        "social.instagram": getString(
          formData,
          "instagram"
        ),
        "social.facebook": getString(formData, "facebook"),
      },
    }
  );

  revalidatePath(`/${store}`);

  redirect(`/${store}/admin/configuracion`);
}

export async function updateOrderStatusAction(
  store: string,
  orderId: string,
  formData: FormData
) {
  await connectDB();

  const tenant = await getSafeTenant(store);

  const status = getString(
    formData,
    "status"
  ) as OrderStatus;

  const trackingNumber = getString(
    formData,
    "trackingNumber"
  );

  const shippingCarrier = getString(
    formData,
    "shippingCarrier"
  );

  const shippingMethod = getString(
    formData,
    "shippingMethod"
  );

  const shippingNotes = getString(
    formData,
    "shippingNotes"
  );

  const allowedStatuses: OrderStatus[] = [
    "pending",
    "paid",
    "preparing",
    "shipped",
    "delivered",
    "cancelled",
    "failed",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Estado inválido");
  }

  const orderBefore = (await Order.findOne({
    _id: orderId,
    tenantId: tenant._id,
  }).lean()) as unknown as MongoOrder | null;

  if (!orderBefore) {
    throw new Error("Pedido no encontrado");
  }

  await Order.updateOne(
    {
      _id: orderId,
      tenantId: tenant._id,
    },
    {
      $set: {
        status,
        trackingNumber,
        shippingCarrier,
        shippingMethod,
        shippingNotes,
      },
    }
  );

  const orderAfter = (await Order.findOne({
    _id: orderId,
    tenantId: tenant._id,
  }).lean()) as unknown as MongoOrder | null;

  if (orderAfter && orderBefore.status !== status) {
    await sendOrderStatusWhatsApp({
      store,
      order: orderAfter,
      status,
    });
  }

  revalidatePath(`/${store}/admin/pedidos`);
  revalidatePath(`/${store}/admin/pedidos/${orderId}`);
}

export async function updateAppearanceAction(
  store: string,
  formData: FormData
) {
  await connectDB();

  const tenant = await getSafeTenant(store);

  await Tenant.updateOne(
    { _id: tenant._id },
    {
      $set: {
        "appearance.logoImage": getString(
          formData,
          "logoImage"
        ),

        "appearance.favicon": getString(
          formData,
          "favicon"
        ),

        "appearance.primaryColor": getString(
          formData,
          "primaryColor"
        ),

        "appearance.secondaryColor": getString(
          formData,
          "secondaryColor"
        ),

        "appearance.backgroundColor": getString(
          formData,
          "backgroundColor"
        ),

        "appearance.textColor": getString(
          formData,
          "textColor"
        ),

        "appearance.buttonRadius": getString(
          formData,
          "buttonRadius"
        ),

        "appearance.fontStyle": getString(
          formData,
          "fontStyle"
        ),

        "appearance.layoutStyle": getString(
          formData,
          "layoutStyle"
        ),

        "appearance.promoBarEnabled":
          formData.get("promoBarEnabled") === "on",

        "appearance.promoMessages": parsePromoMessages(
          getString(formData, "promoMessages")
        ),

        "appearance.heroTitle": getString(
          formData,
          "heroTitle"
        ),

        "appearance.heroSubtitle": getString(
          formData,
          "heroSubtitle"
        ),

        "appearance.heroImage": getString(
          formData,
          "heroImage"
        ),

        "appearance.heroCtaText": getString(
          formData,
          "heroCtaText"
        ),

        "appearance.bannerTitle": getString(
          formData,
          "bannerTitle"
        ),

        "appearance.bannerSubtitle": getString(
          formData,
          "bannerSubtitle"
        ),

        "appearance.bannerImage": getString(
          formData,
          "bannerImage"
        ),
      },
    }
  );

  revalidatePath(`/${store}`);
  revalidatePath(`/${store}/admin/apariencia`);
}