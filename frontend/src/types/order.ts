/** The order lifecycle. The backend will own and update this later. */
export type OrderStatus = "ordered" | "shipping" | "delivered";

/** Admin order statuses from the backend API. */
export type AdminOrderStatus = "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";

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

/** Admin order summary from the listing endpoint. */
export interface AdminOrderSummary {
  id: string;
  status: AdminOrderStatus;
  totalAmount: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
}

/** Admin order details from the detail endpoint. */
export interface AdminOrderItem {
  productId: string;
  quantity: number;
  unitPrice: string;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };
}

export interface AdminOrderDetails {
  id: string;
  userId: string | null;
  trackingToken: string | null;
  status: AdminOrderStatus;
  totalAmount: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

/** Pagination metadata from admin orders listing. */
export interface AdminOrdersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Response shape for admin orders listing. */
export interface AdminOrdersResponse {
  orders: AdminOrderSummary[];
  pagination: AdminOrdersPagination;
}

/** Query parameters for admin orders listing. */
export interface AdminOrdersQuery {
  page?: number;
  limit?: number;
  status?: AdminOrderStatus;
  search?: string;
}

/** Request payload for updating order status. */
export interface UpdateOrderStatusInput {
  status: AdminOrderStatus;
}