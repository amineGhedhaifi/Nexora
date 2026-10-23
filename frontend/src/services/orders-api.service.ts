import { apiRequest, ApiError, tokenStore } from "./api";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItemInput[];
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

interface ApiOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string | number;
  product: ApiProduct;
}

interface ApiOrder {
  id: string;
  userId: string | null;
  status: string;
  totalAmount: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: ApiOrderItem[];
  createdAt: string;
  trackingToken?: string;
}

interface CreateOrderResponse {
  message: string;
  order: ApiOrder;
  trackingToken?: string;
}

interface GetOrderResponse {
  order: ApiOrder;
}

interface GetMyOrdersResponse {
  orders: ApiOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface OrderConfirmation {
  id: string;
  userId: string | null;
  status: string;
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    product: {
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
    };
  }>;
  createdAt: string;
  trackingToken?: string;
}

export interface OrdersPageResult {
  orders: OrderConfirmation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function toOrderConfirmation(apiOrder: ApiOrder): OrderConfirmation {
  return {
    id: apiOrder.id,
    userId: apiOrder.userId,
    status: apiOrder.status,
    totalAmount: Number(apiOrder.totalAmount),
    customerName: apiOrder.customerName,
    customerPhone: apiOrder.customerPhone,
    shippingAddress: apiOrder.shippingAddress,
    items: apiOrder.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.imageUrl ?? null,
      },
    })),
    createdAt: apiOrder.createdAt,
    trackingToken: apiOrder.trackingToken,
  };
}

export const ordersApiService = {
  async createOrder(input: CreateOrderInput): Promise<OrderConfirmation> {
    const token = tokenStore.get();
    const response = await apiRequest<CreateOrderResponse>("/orders", {
      method: "POST",
      body: input,
      auth: !!token,
    });
    const order = toOrderConfirmation(response.order);
    if (response.trackingToken) {
      order.trackingToken = response.trackingToken;
    }
    return order;
  },

  async getOrder(orderId: string, trackingToken?: string): Promise<OrderConfirmation> {
    const token = tokenStore.get();
    const queryParams = trackingToken ? `?trackingToken=${encodeURIComponent(trackingToken)}` : "";
    const response = await apiRequest<GetOrderResponse>(`/orders/${orderId}${queryParams}`, {
      auth: !!token,
    });
    return toOrderConfirmation(response.order);
  },

  async getMyOrders(page = 1, limit = 10): Promise<OrdersPageResult> {
    const response = await apiRequest<GetMyOrdersResponse>(`/orders?page=${page}&limit=${limit}`, {
      auth: true,
    });
    return {
      orders: response.orders.map(toOrderConfirmation),
      pagination: response.pagination,
    };
  },

  async cancelOrder(orderId: string, trackingToken?: string): Promise<OrderConfirmation> {
    const token = tokenStore.get();
    const queryParams = trackingToken ? `?trackingToken=${encodeURIComponent(trackingToken)}` : "";
    const response = await apiRequest<GetOrderResponse>(`/orders/${orderId}/cancel${queryParams}`, {
      method: "PATCH",
      auth: !!token,
    });
    return toOrderConfirmation(response.order);
  },
};

export function isOrderApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}