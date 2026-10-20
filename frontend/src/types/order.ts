/** The order lifecycle. The backend will own and update this later. */
export type OrderStatus = "ordered" | "shipping" | "delivered";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string | null;
  quantity: number;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  /** Also the order number shown to the customer, e.g. "NX-483920". */
  id: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

/** What the checkout sends. The id, status and date are set by the service (later: the API). */
export type CreateOrderInput = Omit<Order, "id" | "status" | "createdAt">;
