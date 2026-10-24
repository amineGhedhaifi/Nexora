import { apiRequest, ApiError } from "./api";

interface DashboardStats {
  revenue: string;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}

interface BestSellingProduct {
  id: string;
  name: string;
  imageUrl: string | null;
  price: string;
  unitsSold: number;
}

interface RevenueOverviewItem {
  month: string;
  revenue: number;
}

interface RecentOrderApi {
  id: string;
  userId: string | null;
  customerName: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

interface DashboardResponse {
  stats: DashboardStats;
  bestSellingProducts: BestSellingProduct[];
  revenueOverview: RevenueOverviewItem[];
  recentOrders: RecentOrderApi[];
}

export const adminDashboardService = {
  async getDashboard(): Promise<DashboardResponse> {
    const response = await apiRequest<DashboardResponse>("/dashboard", {
      auth: true,
    });
    return response;
  },
};

export function isAdminDashboardApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}