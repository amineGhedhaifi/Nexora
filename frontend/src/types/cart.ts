/** A snapshot of the product at the time it was added, so the cart renders without a product lookup. */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  quantity: number;
}

export type CartProductInput = Omit<CartItem, "quantity">;

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  total: number;
}
