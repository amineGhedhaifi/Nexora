import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { CART_STORAGE_KEY } from "@/lib/constants";
import { calculateTotals, clampQuantity } from "@/lib/cart";
import { cartService } from "@/services/cart.service";
import type { CartItem, CartProductInput } from "@/types/cart";
import { CartContext, type CartContextValue } from "./cart-context";

type CartAction =
  | { type: "add"; product: CartProductInput; quantity: number }
  | { type: "set-quantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" }
  | { type: "replace"; items: CartItem[] };

function cartReducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "add": {
      const { product, quantity } = action;
      const existing = items.find(
        (item) => item.productId === product.productId,
      );
      if (existing) {
        return items.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                ...product,
                quantity: clampQuantity(
                  item.quantity + quantity,
                  product.stock,
                ),
              }
            : item,
        );
      }
      return [
        ...items,
        { ...product, quantity: clampQuantity(quantity, product.stock) },
      ];
    }
    case "set-quantity":
      return items.map((item) =>
        item.productId === action.productId
          ? { ...item, quantity: clampQuantity(action.quantity, item.stock) }
          : item,
      );
    case "remove":
      return items.filter((item) => item.productId !== action.productId);
    case "clear":
      return [];
    case "replace":
      return action.items;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, () =>
    cartService.load(),
  );
  const [isOpen, setIsOpen] = useState(false);

  // Save on every change
  useEffect(() => {
    cartService.save(items);
  }, [items]);

  // Keep multiple browser tabs in sync
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY || event.key === null) {
        dispatch({ type: "replace", items: cartService.load() });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const totals = useMemo(() => calculateTotals(items), [items]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    (product, quantity = 1, options) => {
      if (product.stock <= 0) return;
      dispatch({ type: "add", product, quantity });
      if (options?.openCart !== false) setIsOpen(true);
    },
    [],
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "set-quantity", productId, quantity });
  }, []);

  const removeItem = useCallback((productId: string) => {
    dispatch({ type: "remove", productId });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "clear" }), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ...totals,
      isOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    }),
    [
      items,
      totals,
      isOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openCart,
      closeCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
