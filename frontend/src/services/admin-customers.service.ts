import { apiRequest, ApiError } from "./api";
import type {
  Customer,
  AdminCustomersResponse,
  AdminCustomersQuery,
} from "@/types/customer";

interface CustomerApi {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

interface AdminCustomersResponseApi {
  customers: CustomerApi[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function toCustomer(api: CustomerApi): Customer {
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    role: api.role as Customer["role"],
    createdAt: api.createdAt,
    totalOrders: api.totalOrders,
    totalSpent: api.totalSpent,
  };
}

export const adminCustomersService = {
  /** GET /api/customers/admin - requires admin auth. Returns paginated customers with optional filtering. */
  async getCustomers(query: AdminCustomersQuery = {}): Promise<AdminCustomersResponse> {
    const searchParams = new URLSearchParams();
    if (query.page) searchParams.set("page", String(query.page));
    if (query.limit) searchParams.set("limit", String(query.limit));
    if (query.search) searchParams.set("search", query.search);
    if (query.role) searchParams.set("role", query.role);

    const response = await apiRequest<AdminCustomersResponseApi>(
      `/customers/admin?${searchParams.toString()}`,
      { auth: true },
    );

    return {
      customers: response.customers.map(toCustomer),
      pagination: response.pagination,
    };
  },
};

export function isAdminCustomersApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}