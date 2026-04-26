"use client";

import { useEffect } from "react";

type Props = {
  store: string;
};

export function ClearCartOnSuccess({ store }: Props) {
  useEffect(() => {
    window.localStorage.removeItem(`cart_${store}`);
    window.dispatchEvent(new Event("cart:updated"));
  }, [store]);

  return null;
}