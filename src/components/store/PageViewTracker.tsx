"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/track-event";

type Props = {
  tenantSlug: string;
};

export function PageViewTracker({ tenantSlug }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();

    trackEvent({
      tenantSlug,
      event: "page_view",
      path: query ? `${pathname}?${query}` : pathname,
    });
  }, [tenantSlug, pathname, searchParams]);

  return null;
}