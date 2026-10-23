import { apiRequest, ApiError } from "./api";
import type {
  AdminOrderSummary,
  AdminOrderDetails,
  AdminOrdersResponse,
  AdminOrdersQuery,
  UpdateOrderStatusInput,
} from "@/types/order";

interface AdminOrderSummaryApi {
  id: string;
  status: string;
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

interface AdminOrderDetailsApi {
  id: string;
  userId: string | null;
  trackingToken: string | null;
  status: string;
  totalAmount: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: string;
    product: {
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
    };
  }>;
}

interface AdminOrdersResponseApi {
  orders: AdminOrderSummaryApi[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function toAdminOrderSummary(api: AdminOrderSummaryApi): AdminOrderSummary {
  return {
    id: api.id,
    status: api.status as AdminOrderSummary["status"],
    totalAmount: api.totalAmount,
    customerName: api.customerName,
    customerPhone: api.customerPhone,
    shippingAddress: api.shippingAddress,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    _count: api._count,
  };
}

function toAdminOrderDetails(api: AdminOrderDetailsApi): AdminOrderDetails {
  return {
    id: api.id,
    userId: api.userId,
    trackingToken: api.trackingToken,
    status: api.status as AdminOrderDetails["status"],
    totalAmount: api.totalAmount,
    customerName: api.customerName,
    customerPhone: api.customerPhone,
    shippingAddress: api.shippingAddress,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    items: api.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        imageUrl: item.product.imageUrl ?? null,
      },
    })),
  };
}

export const adminOrdersService = {
  /** GET /api/orders/admin - requires admin auth. Returns paginated orders with optional filtering. */
  async getOrders(query: AdminOrdersQuery = {}): Promise<AdminOrdersResponse> {
    const searchParams = new URLSearchParams();
    if (query.page) searchParams.set("page", String(query.page));
    if (query.limit) searchParams.set("limit", String(query.limit));
    if (query.status) searchParams.set("status", query.status);
    if (query.search) searchParams.set("search", query.search);

    const response = await apiRequest<AdminOrdersResponseApi>(`/orders/admin?${searchParams.toString()}`, {
      auth: true,
    });

    return {
      orders: response.orders.map(toAdminOrderSummary),
      pagination: response.pagination,
    };
  },

  /** GET /api/orders/admin/:id - requires admin auth. Returns full order details with items. */
  async getOrderById(orderId: string): Promise<AdminOrderDetails> {
    const response = await apiRequest<{ order: AdminOrderDetailsApi }>(`/orders/admin/${orderId}`, {
      auth: true,
    });
    return toAdminOrderDetails(response.order);
  },

  /** PATCH /api/orders/admin/:id/status - requires admin auth. Updates order status. */
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusInput): Promise<AdminOrderDetails> {
    const response = await apiRequest<{ order: AdminOrderDetailsApi }>(`/orders/admin/${orderId}/status`, {
      method: "PATCH",
      body: data,
      auth: true,
    });
    return toAdminOrderDetails(response.order);
  },
};

export function isAdminOrderApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}