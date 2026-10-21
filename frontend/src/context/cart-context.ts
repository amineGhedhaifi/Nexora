import { createContext } from "react";
import type { CartItem, CartProductInput, CartTotals } from "@/types/cart";

export interface CartContextValue extends CartTotals {
  items: CartItem[];
  /** Whether the cart drawer is open (the drawer is built in the next step). */
  isOpen: boolean;
  /** True while loading the authenticated cart from the API. */
  isLoading: boolean;
  /** Error message if the last API operation failed. */
  error: string | null;
  /** Adds a product, or increases its quantity if it is already in the cart. */
  addItem: (
    product: CartProductInput,
    quantity?: number,
    options?: { openCart?: boolean },
  ) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);
