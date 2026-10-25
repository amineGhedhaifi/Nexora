import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { CART_STORAGE_KEY } from "@/lib/constants";
import { calculateTotals, clampQuantity } from "@/lib/cart";
import { cartService } from "@/services/cart.service";
import { cartApiService, isCartApiError } from "@/services/cart-api.service";
import type { CartItem, CartProductInput } from "@/types/cart";
import { CartContext, type CartContextValue } from "./cart-context";

type CartAction =
  | { type: "add"; product: CartProductInput; quantity: number }
  | { type: "set-quantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clear" }
  | { type: "replace"; items: CartItem[] }
  | { type: "set-loading"; loading: boolean }
  | { type: "set-error"; error: string | null };

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const { product, quantity } = action;
      const existing = state.items.find(
        (item) => item.productId === product.productId,
      );
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((item) =>
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
      } else {
        newItems = [
          ...state.items,
          { ...product, quantity: clampQuantity(quantity, product.stock) },
        ];
      }
      return { ...state, items: newItems, error: null };
    }
    case "set-quantity":
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.productId
            ? { ...item, quantity: clampQuantity(action.quantity, item.stock) }
            : item,
        ),
        error: null,
      };
    case "remove":
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.productId),
        error: null,
      };
    case "clear":
      return { ...state, items: [], error: null };
    case "replace":
      return { ...state, items: action.items, isLoading: false, error: null };
    case "set-loading":
      return { ...state, isLoading: action.loading };
    case "set-error":
      return { ...state, error: action.error, isLoading: false };
  }
}

const initialState: CartState = {
  items: [],
  isLoading: true,
  error: null,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const [state, dispatch] = useReducer(cartReducer, initialState);

  const { items, isLoading } = state;

  const loadGuestCart = useCallback(() => {
    dispatch({ type: "replace", items: cartService.load() });
  }, []);

  const loadApiCart = useCallback(async () => {
    dispatch({ type: "set-loading", loading: true });
    try {
      const apiItems = await cartApiService.getCart();
      dispatch({ type: "replace", items: apiItems });
    } catch (error) {
      if (isCartApiError(error)) {
        dispatch({ type: "set-error", error: error.message });
      } else {
        dispatch({ type: "set-error", error: "Failed to load cart" });
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        loadApiCart();
      } else {
        loadGuestCart();
      }
    }
  }, [isAuthenticated, authLoading, loadApiCart, loadGuestCart]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      cartService.save(items);
    }
  }, [items, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isAuthenticated) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === CART_STORAGE_KEY || event.key === null) {
          loadGuestCart();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    }
  }, [isAuthenticated, loadGuestCart]);

  const totals = useMemo(() => calculateTotals(items), [items]);

  const addItem = useCallback<CartContextValue["addItem"]>(
    async (product, quantity = 1, options) => {
      if (product.stock <= 0) return;

      if (isAuthenticated) {
        dispatch({ type: "set-loading", loading: true });
        try {
          const apiItem = await cartApiService.addItem(
            product.productId,
            quantity,
          );
          dispatch({
            type: "replace",
            items: [...items.filter((i) => i.productId !== apiItem.productId), apiItem],
          });
        } catch (error) {
          if (isCartApiError(error)) {
            dispatch({ type: "set-error", error: error.message });
          }
          dispatch({ type: "set-loading", loading: false });
        }
      } else {
        dispatch({ type: "add", product, quantity });
      }
      if (options?.openCart !== false) setIsOpen(true);
    },
    [isAuthenticated, items],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (isAuthenticated) {
        dispatch({ type: "set-loading", loading: true });
        try {
          const apiItem = await cartApiService.updateItem(productId, quantity);
          dispatch({ type: "replace", items: items.map((i) => (i.productId === productId ? apiItem : i)) });
        } catch (error) {
          if (isCartApiError(error)) {
            dispatch({ type: "set-error", error: error.message });
          }
          dispatch({ type: "set-loading", loading: false });
        }
      } else {
        dispatch({ type: "set-quantity", productId, quantity });
      }
    },
    [isAuthenticated, items],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (isAuthenticated) {
        dispatch({ type: "set-loading", loading: true });
        try {
          await cartApiService.removeItem(productId);
          dispatch({ type: "replace", items: items.filter((i) => i.productId !== productId) });
        } catch (error) {
          if (isCartApiError(error)) {
            dispatch({ type: "set-error", error: error.message });
          }
          dispatch({ type: "set-loading", loading: false });
        }
      } else {
        dispatch({ type: "remove", productId });
      }
    },
    [isAuthenticated, items],
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      dispatch({ type: "set-loading", loading: true });
      try {
        await cartApiService.clearCart();
        dispatch({ type: "clear" });
      } catch (error) {
        if (isCartApiError(error)) {
          dispatch({ type: "set-error", error: error.message });
        }
        dispatch({ type: "set-loading", loading: false });
      }
    } else {
      dispatch({ type: "clear" });
    }
  }, [isAuthenticated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      ...totals,
      isOpen,
      isLoading,
      error: state.error,
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
      isLoading,
      state.error,
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