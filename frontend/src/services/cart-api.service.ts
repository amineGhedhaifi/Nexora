import { apiRequest, ApiError } from "./api";
import type { CartItem } from "@/types/cart";

interface ApiCartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: string | number;
    stock: number;
    imageUrl?: string | null;
  };
}

interface ApiCart {
  id: string;
  items: ApiCartItem[];
  totalItems: number;
  totalAmount: string;
}

function toCartItem(apiItem: ApiCartItem): CartItem {
  return {
    productId: apiItem.productId,
    slug: apiItem.product.slug,
    name: apiItem.product.name,
    price: Number(apiItem.product.price),
    image: apiItem.product.imageUrl ?? null,
    stock: apiItem.product.stock,
    quantity: apiItem.quantity,
  };
}

function toCartItems(apiCart: ApiCart): CartItem[] {
  return apiCart.items.map(toCartItem);
}

export const cartApiService = {
  async getCart(): Promise<CartItem[]> {
    const response = await apiRequest<{ cart: ApiCart }>("/cart", {
      auth: true,
    });
    return toCartItems(response.cart);
  },

  async addItem(productId: string, quantity: number): Promise<CartItem> {
    const response = await apiRequest<{ item: ApiCartItem }>(
      "/cart/items",
      {
        method: "POST",
        body: { productId, quantity },
        auth: true,
      },
    );
    return toCartItem(response.item);
  },

  async updateItem(productId: string, quantity: number): Promise<CartItem> {
    const response = await apiRequest<{ item: ApiCartItem }>(
      `/cart/items/${productId}`,
      {
        method: "PATCH",
        body: { quantity },
        auth: true,
      },
    );
    return toCartItem(response.item);
  },

  async removeItem(productId: string): Promise<void> {
    await apiRequest(`/cart/items/${productId}`, {
      method: "DELETE",
      auth: true,
    });
  },

  async clearCart(): Promise<void> {
    await apiRequest("/cart", {
      method: "DELETE",
      auth: true,
    });
  },
};

export function isCartApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}