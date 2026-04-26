"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

type CartItem = {
  productId: string;
  variantSku?: string;
  title: string;
  slug: string;
  price: number;
  image?: string;
  quantity: number;
  talle?: string;
  color?: string;
};

type CartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  isOpen: boolean;
  total: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  increaseItem: (productId: string, variantSku?: string) => void;
  decreaseItem: (productId: string, variantSku?: string) => void;
  removeItem: (productId: string, variantSku?: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const EMPTY_CART: CartItem[] = [];
const CART_EVENT = "cart:updated";

function getStorageKey(store: string) {
  return `cart_${store}`;
}

function readCart(storageKey: string): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;

  try {
    const saved = window.localStorage.getItem(storageKey);
    return saved ? (JSON.parse(saved) as CartItem[]) : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

function writeCart(storageKey: string, items: CartItem[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

function subscribeCart(callback: () => void) {
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function CartProvider({
  children,
  store,
}: {
  children: ReactNode;
  store: string;
}) {
  const storageKey = getStorageKey(store);
  const [isOpen, setIsOpen] = useState(false);

  const items = useSyncExternalStore(
    subscribeCart,
    () => readCart(storageKey),
    () => EMPTY_CART
  );

  const total = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  function updateCart(updater: (current: CartItem[]) => CartItem[]) {
    const current = readCart(storageKey);
    const next = updater(current);
    writeCart(storageKey, next);
  }

  function addItem(item: Omit<CartItem, "quantity">) {
    updateCart((current) => {
      const exists = current.find(
        (cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.variantSku === item.variantSku
      );

      if (exists) {
        return current.map((cartItem) =>
          cartItem.productId === item.productId &&
          cartItem.variantSku === item.variantSku
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }

      return [...current, { ...item, quantity: 1 }];
    });

    setIsOpen(true);
  }

  function increaseItem(productId: string, variantSku?: string) {
    updateCart((current) =>
      current.map((item) =>
        item.productId === productId && item.variantSku === variantSku
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseItem(productId: string, variantSku?: string) {
    updateCart((current) =>
      current
        .map((item) =>
          item.productId === productId && item.variantSku === variantSku
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId: string, variantSku?: string) {
    updateCart((current) =>
      current.filter(
        (item) =>
          !(item.productId === productId && item.variantSku === variantSku)
      )
    );
  }

  return (
    <CartContext.Provider
      value={{
        items,
        hydrated: true,
        isOpen,
        total,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        increaseItem,
        decreaseItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return ctx;
}