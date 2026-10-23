export type CustomerRole = "CLIENT" | "ADMIN";

export interface Customer {
  id: string;
  name: string;
  email: string;
  role: CustomerRole;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
}

export interface AdminCustomersPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminCustomersResponse {
  customers: Customer[];
  pagination: AdminCustomersPagination;
}

export interface AdminCustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: CustomerRole;
}