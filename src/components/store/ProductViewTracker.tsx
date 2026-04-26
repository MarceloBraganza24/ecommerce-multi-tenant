"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/track-event";

type Props = {
  tenantSlug: string;
  productId: string;
  productSlug: string;
  productTitle: string;
  value: number;
};

export function ProductViewTracker({
  tenantSlug,
  productId,
  productSlug,
  productTitle,
  value,
}: Props) {
  useEffect(() => {
    trackEvent({
      tenantSlug,
      event: "view_product",
      productId,
      productSlug,
      productTitle,
      value,
    });
  }, [tenantSlug, productId, productSlug, productTitle, value]);

  return null;
}